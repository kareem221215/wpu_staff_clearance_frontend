import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { delay, of } from 'rxjs';
import { RequestApprovalStatusEnum } from '../../core/enums/request-approval-status.enum';
import { RequestActionTypeEnum } from '../../core/enums/request-action-type.enum';
import { IRequestApproval } from '../../core/interfaces/request-approval.interface';
import { AuthService } from '../services/auth.service';
import { COLLEGES } from '../mock-data/colleges.mock';
import { APPROVALS, REQUESTS } from '../mock-data/requests.mock';
import { DIRECT_MANAGERS, MANAGERS, STAFF } from '../mock-data/users.mock';
import { GATE_APIS_SERVICE_URL_TOKEN } from '../tokens/gate-apis-service-url.token';
import { STAFF_CLEARANCE_APIS_SERVICE_URL_TOKEN } from '../tokens/staff-clearance-apis-service-url.token';

const ok = (body: unknown) => of(new HttpResponse({ body, status: 200 }));

function findRequestIndex(requestId: number) {
  return REQUESTS.findIndex((r) => r.requestId === requestId);
}

// Records a decision from `staffId` on `requestId`, but only if it's actually
// their turn — mirrors what a real backend would enforce server-side. Then
// recomputes who's next in the fixed 7-person chain (direct manager, then the
// 6 fixed managers in order) and whether the request is now complete.
function applyDecision(requestId: number, staffId: number, approved: boolean, note: string | null) {
  const requestIndex = findRequestIndex(requestId);
  if (requestIndex === -1) return;

  const request = REQUESTS[requestIndex];
  if (request.nextApproverStaffId !== staffId) return;

  const approvalIndex = APPROVALS.findIndex(
    (a) => a.requestId === requestId && a.staffId === staffId,
  );
  if (approvalIndex === -1) return;

  APPROVALS[approvalIndex] = {
    ...APPROVALS[approvalIndex],
    status: approved ? RequestApprovalStatusEnum.APPROVED : RequestApprovalStatusEnum.REJECTED,
    note,
    decidedAt: new Date(),
  };

  const chain = APPROVALS.filter((a) => a.requestId === requestId).sort((a, b) => a.order - b.order);
  const nextPending = chain.find((a) => a.status !== RequestApprovalStatusEnum.APPROVED);
  const approvedCount = chain.filter((a) => a.status === RequestApprovalStatusEnum.APPROVED).length;

  REQUESTS[requestIndex] = {
    ...request,
    approvedCount,
    completed: !nextPending,
    nextApproverStaffId: nextPending?.staffId ?? null,
  };
}

export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  const staffClearanceBaseUrl = inject(STAFF_CLEARANCE_APIS_SERVICE_URL_TOKEN);
  const gateApisBaseUrl = inject(GATE_APIS_SERVICE_URL_TOKEN);
  const myStaffId = inject(AuthService).accessTokenPayload?.sub ?? null;

  // ─── Gate APIs ───────────────────────────────────────────────────────────────

  if (req.url.startsWith(gateApisBaseUrl)) {
    const path = req.url.slice(gateApisBaseUrl.length).split('?')[0];

    if (req.method === 'GET' && path === '/colleges') {
      return ok(COLLEGES);
    }

    return next(req);
  }

  // ─── Staff Clearance APIs ────────────────────────────────────────────────────

  if (!req.url.startsWith(staffClearanceBaseUrl)) {
    return next(req);
  }

  const path = req.url.slice(staffClearanceBaseUrl.length).split('?')[0];

  if (req.method === 'GET' && path === '/staff') {
    return ok({ data: STAFF, total: STAFF.length });
  }

  if (req.method === 'GET' && path === '/managers') {
    const collegeIdsParam = req.params.get('collegeIds');
    const collegeIds = collegeIdsParam ? collegeIdsParam.split(',').map(Number) : null;

    // delete later
    const relevantColleges = collegeIds
      ? COLLEGES.filter((c) => collegeIds.includes(c.collegeId))
      : COLLEGES;

    const directManagerIds = relevantColleges.map((c) => c.directManagerId);
    const directManagers = DIRECT_MANAGERS.filter((m) => directManagerIds.includes(m.staffId));

    const all = [...directManagers, ...MANAGERS];
    return ok({ data: all, total: all.length });
  }

  const staffById = path.match(/^\/staff\/(\d+)$/);
  if (req.method === 'GET' && staffById) {
    return ok(STAFF.find((s) => s.staffId === Number(staffById[1])) ?? null);
  }

  // GET /stats
  if (req.method === 'GET' && path === '/stats') {
    return ok({
      requestCount: REQUESTS.length,
      completedRequestCount: REQUESTS.filter((r) => r.completed).length,
      archivedRequestCount: REQUESTS.filter((r) => r.archivedAt).length,
    });
  }

  // GET /requests
  if (req.method === 'GET' && path === '/requests') {
    let results = REQUESTS;

    const archivedParam = req.params.get('archived');
    if (archivedParam !== null) {
      const archived = archivedParam === 'true';
      results = results.filter((r) => !!r.archivedAt === archived);
    }

    return ok({ data: results, total: results.length });
  }

  // GET /requests/one-by-staff/:staffId  — must come before /requests/:id
  const requestByStaff = path.match(/^\/requests\/one-by-staff\/(\d+)$/);
  if (req.method === 'GET' && requestByStaff) {
    return ok(REQUESTS.find((r) => r.staffId === Number(requestByStaff[1])) ?? null);
  }

  // GET /requests/:id/approvals  — must come before /requests/:id
  const approvalsList = path.match(/^\/requests\/(\d+)\/approvals$/);
  if (req.method === 'GET' && approvalsList) {
    return ok(
      APPROVALS.filter((a) => a.requestId === Number(approvalsList[1])).sort(
        (a, b) => a.order - b.order,
      ),
    );
  }

  // GET /requests/:id
  const requestById = path.match(/^\/requests\/(\d+)$/);
  if (req.method === 'GET' && requestById) {
    return ok(REQUESTS.find((r) => r.requestId === Number(requestById[1])) ?? null);
  }

  // POST /requests (create) — snapshots the staff's direct manager + the 6
  // fixed managers, in order, into a brand-new 7-row approval chain.
  if (req.method === 'POST' && path === '/requests') {
    const { staffId } = req.body as { staffId: number };
    const staff = STAFF.find((s) => s.staffId === staffId);

    if (staff) {
      const college = COLLEGES.find((c) => c.collegeId === staff.collegeId);
      const directManager = DIRECT_MANAGERS.find((m) => m.staffId === college?.directManagerId);
      const roster = directManager ? [directManager, ...MANAGERS] : [...MANAGERS];

      const requestId = Math.max(1000, ...REQUESTS.map((r) => r.requestId)) + 1;
      let nextApprovalId = Math.max(0, ...APPROVALS.map((a) => a.requestApprovalId)) + 1;

      const newApprovals: IRequestApproval[] = roster.map((manager, index) => ({
        requestApprovalId: nextApprovalId++,
        requestId,
        order: index + 1,
        staffId: manager.staffId,
        staffName: manager.name,
        departmentName: manager.collegeName,
        status: RequestApprovalStatusEnum.PENDING,
        note: null,
        decidedAt: null,
      }));

      APPROVALS.push(...newApprovals);

      REQUESTS.push({
        requestId,
        staffId: staff.staffId,
        staffName: staff.name,
        directManagerId: directManager?.staffId ?? 0,
        directManagerName: directManager?.name ?? '',
        collegeName: staff.collegeName,
        approvedCount: 0,
        completed: false,
        archivedAt: null,
        nextApproverStaffId: roster[0]?.staffId ?? null,
      });
    }

    return ok(null).pipe(delay(1500));
  }

  // POST /requests/:id/approve
  const approveReq = path.match(/^\/requests\/(\d+)\/approve$/);
  if (req.method === 'POST' && approveReq) {
    const { approved, note } = req.body as { approved: boolean; note: string | null };

    if (myStaffId !== null) {
      applyDecision(Number(approveReq[1]), myStaffId, approved, note);
    }

    return ok(null);
  }

  // POST /requests/:id/actions
  const actionsReq = path.match(/^\/requests\/(\d+)\/actions$/);
  if (req.method === 'POST' && actionsReq) {
    const requestId = Number(actionsReq[1]);
    const { type, note } = req.body as { type: RequestActionTypeEnum; note?: string | null };

    if (type === RequestActionTypeEnum.ARCHIVE) {
      const requestIndex = findRequestIndex(requestId);

      if (requestIndex !== -1) {
        REQUESTS[requestIndex] = { ...REQUESTS[requestIndex], archivedAt: new Date() };
      }
    } else if (myStaffId !== null) {
      applyDecision(requestId, myStaffId, type === RequestActionTypeEnum.APPROVE, note ?? null);
    }

    return ok(null);
  }

  return next(req);
};
