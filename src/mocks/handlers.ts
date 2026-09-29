import { delay, http, HttpResponse } from 'msw';
import { jwtDecode } from 'jwt-decode';
import { RequestApprovalStatusEnum } from '../app/core/enums/request-approval-status.enum';
import { RequestActionTypeEnum } from '../app/core/enums/request-action-type.enum';
import { IRequestApproval } from '../app/core/interfaces/request-approval.interface';
import { IAccessTokenPayload } from '../app/shared/interfaces/access-token-payload.interface';
import { DEPARTMENTS } from '../app/shared/mock-data/departments.mock';
import { APPROVALS, REQUESTS } from '../app/shared/mock-data/requests.mock';
import { DIRECT_MANAGERS, MANAGERS, STAFF } from '../app/shared/mock-data/users.mock';

const staff = (path: string) => `*/wpu-staff-clearance/apis${path}`;
const gate = (path: string) => `*/wpu-gate/apis${path}`;

function currentStaffId(request: Request): number | null {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');

  if (!token) return null;

  try {
    return jwtDecode<IAccessTokenPayload>(token).sub;
  } catch {
    return null;
  }
}

function findRequestIndex(requestId: number) {
  return REQUESTS.findIndex((r) => r.requestId === requestId);
}

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

  const chain = APPROVALS.filter((a) => a.requestId === requestId).sort(
    (a, b) => a.order - b.order,
  );
  const nextPending = chain.find((a) => a.status !== RequestApprovalStatusEnum.APPROVED);
  const approvedCount = chain.filter((a) => a.status === RequestApprovalStatusEnum.APPROVED).length;

  REQUESTS[requestIndex] = {
    ...request,
    approvedCount,
    completed: !nextPending,
    nextApproverStaffId: nextPending?.staffId ?? null,
  };
}

export const handlers = [
  // ─── Gate APIs ───────────────────────────────────────────────────────────────

  http.get(gate('/departments'), () => HttpResponse.json(DEPARTMENTS)),

  // ─── Staff Clearance APIs ────────────────────────────────────────────────────

  http.get(staff('/staff'), () => HttpResponse.json({ data: STAFF, total: STAFF.length })),

  http.get(staff('/managers'), ({ request }) => {
    const url = new URL(request.url);
    const departmentIdsParam = url.searchParams.get('departmentIds');
    const departmentIds = departmentIdsParam ? departmentIdsParam.split(',').map(Number) : null;

    const relevantDepartments = departmentIds
      ? DEPARTMENTS.filter((d) => departmentIds.includes(d.departmentId))
      : DEPARTMENTS;

    const directManagerIds = relevantDepartments.map((d) => d.directManagerId);
    const directManagers = DIRECT_MANAGERS.filter((m) => directManagerIds.includes(m.staffId));

    const all = [...directManagers, ...MANAGERS];
    return HttpResponse.json({ data: all, total: all.length });
  }),

  http.get(staff('/staff/:id'), ({ params }) => {
    const found = STAFF.find((s) => s.staffId === Number(params['id']));
    return HttpResponse.json(found ?? null);
  }),

  http.get(staff('/stats'), () =>
    HttpResponse.json({
      requestCount: REQUESTS.length,
      completedRequestCount: REQUESTS.filter((r) => r.completed).length,
      archivedRequestCount: REQUESTS.filter((r) => r.archivedAt).length,
    }),
  ),

  http.get(staff('/requests'), ({ request }) => {
    const url = new URL(request.url);
    let results = REQUESTS;

    const archivedParam = url.searchParams.get('archived');
    if (archivedParam !== null) {
      const archived = archivedParam === 'true';
      results = results.filter((r) => !!r.archivedAt === archived);
    }

    return HttpResponse.json({ data: results, total: results.length });
  }),

  // Must come before /requests/:id
  http.get(staff('/requests/one-by-staff/:staffId'), ({ params }) => {
    const found = REQUESTS.find((r) => r.staffId === Number(params['staffId']));
    return HttpResponse.json(found ?? null);
  }),

  // Must come before /requests/:id
  http.get(staff('/requests/:id/approvals'), ({ params }) => {
    const approvals = APPROVALS.filter((a) => a.requestId === Number(params['id'])).sort(
      (a, b) => a.order - b.order,
    );
    return HttpResponse.json(approvals);
  }),

  http.get(staff('/requests/:id'), ({ params }) => {
    const found = REQUESTS.find((r) => r.requestId === Number(params['id']));
    return HttpResponse.json(found ?? null);
  }),

  http.post(staff('/requests'), async ({ request }) => {
    const { staffId } = (await request.json()) as { staffId: number };
    const staffMember = STAFF.find((s) => s.staffId === staffId);

    if (staffMember) {
      const department = DEPARTMENTS.find((d) => d.departmentId === staffMember.departmentId);
      const directManager = DIRECT_MANAGERS.find((m) => m.staffId === department?.directManagerId);
      const roster = directManager ? [directManager, ...MANAGERS] : [...MANAGERS];

      const requestId = Math.max(1000, ...REQUESTS.map((r) => r.requestId)) + 1;
      let nextApprovalId = Math.max(0, ...APPROVALS.map((a) => a.requestApprovalId)) + 1;

      const newApprovals: IRequestApproval[] = roster.map((manager, index) => ({
        requestApprovalId: nextApprovalId++,
        requestId,
        order: index + 1,
        staffId: manager.staffId,
        staffName: manager.name,
        departmentName: manager.departmentName,
        status: RequestApprovalStatusEnum.PENDING,
        note: null,
        decidedAt: null,
      }));

      APPROVALS.push(...newApprovals);

      REQUESTS.push({
        requestId,
        staffId: staffMember.staffId,
        staffName: staffMember.name,
        directManagerId: directManager?.staffId ?? 0,
        directManagerName: directManager?.name ?? '',
        departmentName: staffMember.departmentName,
        approvedCount: 0,
        completed: false,
        archivedAt: null,
        nextApproverStaffId: roster[0]?.staffId ?? null,
      });
    }

    await delay(1500);
    return HttpResponse.json(null);
  }),

  http.post(staff('/requests/:id/approve'), async ({ request, params }) => {
    const { approved, note } = (await request.json()) as { approved: boolean; note: string | null };
    const myStaffId = currentStaffId(request);

    if (myStaffId !== null) {
      applyDecision(Number(params['id']), myStaffId, approved, note);
    }

    return HttpResponse.json(null);
  }),

  http.post(staff('/requests/:id/actions'), async ({ request, params }) => {
    const requestId = Number(params['id']);
    const { type, note } = (await request.json()) as {
      type: RequestActionTypeEnum;
      note?: string | null;
    };

    if (type === RequestActionTypeEnum.ARCHIVE) {
      const requestIndex = findRequestIndex(requestId);

      if (requestIndex !== -1) {
        REQUESTS[requestIndex] = { ...REQUESTS[requestIndex], archivedAt: new Date() };
      }
    } else {
      const myStaffId = currentStaffId(request);

      if (myStaffId !== null) {
        applyDecision(requestId, myStaffId, type === RequestActionTypeEnum.APPROVE, note ?? null);
      }
    }

    return HttpResponse.json(null);
  }),
];
