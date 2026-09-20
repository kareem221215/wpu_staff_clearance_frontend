import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { delay, of } from 'rxjs';
import { ICollege } from '../../core/interfaces/college.interface';
import { APPROVALS, REQUESTS } from '../mock-data/requests.mock';
import { DIRECT_MANAGERS, MANAGERS, STAFF } from '../mock-data/users.mock';
import { GATE_APIS_SERVICE_URL_TOKEN } from '../tokens/gate-apis-service-url.token';
import { STAFF_CLEARANCE_APIS_SERVICE_URL_TOKEN } from '../tokens/staff-clearance-apis-service-url.token';

const COLLEGES: ICollege[] = [
  { collegeId: 1, alias: 'pharmacy', name: 'كلية الصيدلة' },
  { collegeId: 2, alias: 'it', name: 'كلية تقنية المعلومات' },
  { collegeId: 3, alias: 'architecture', name: 'كلية الهندسة المعمارية' },
  { collegeId: 4, alias: 'dentistry', name: 'كلية طب الأسنان' },
  { collegeId: 5, alias: 'civil_engineering', name: 'كلية الهندسة المدنية' },
];

const ok = (body: unknown) => of(new HttpResponse({ body, status: 200 }));

export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  const staffClearanceBaseUrl = inject(STAFF_CLEARANCE_APIS_SERVICE_URL_TOKEN);
  const gateApisBaseUrl = inject(GATE_APIS_SERVICE_URL_TOKEN);

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
    const all = [...DIRECT_MANAGERS, ...MANAGERS];
    return ok({ data: all, total: all.length });
  }

  const staffById = path.match(/^\/staffs\/(\d+)$/);
  if (req.method === 'GET' && staffById) {
    return ok(STAFF.find((s) => s.staffId === Number(staffById[1])) ?? null);
  }

  // GET /stats
  if (req.method === 'GET' && path === '/stats') {
    return ok({
      requestCount: REQUESTS.length,
      completedRequestCount: REQUESTS.filter((r) => r.completed).length,
      OnGoingCount: REQUESTS.filter((r) => !r.completed).length,
    });
  }

  // GET /requests
  if (req.method === 'GET' && path === '/requests') {
    return ok({ data: REQUESTS, total: REQUESTS.length });
  }

  // GET /requests/one-by-staff/:staffId  — must come before /requests/:id
  const requestByStaff = path.match(/^\/requests\/one-by-staff\/(\d+)$/);
  if (req.method === 'GET' && requestByStaff) {
    return ok(REQUESTS.find((r) => r.staffId === Number(requestByStaff[1])) ?? null);
  }

  // GET /requests/:id/approvals  — must come before /requests/:id
  const approvalsList = path.match(/^\/requests\/(\d+)\/approvals$/);
  if (req.method === 'GET' && approvalsList) {
    return ok(APPROVALS.filter((a) => a.requestId === Number(approvalsList[1])));
  }

  // GET /requests/:id
  const requestById = path.match(/^\/requests\/(\d+)$/);
  if (req.method === 'GET' && requestById) {
    return ok(REQUESTS.find((r) => r.requestId === Number(requestById[1])) ?? null);
  }

  // POST /requests (create)
  if (req.method === 'POST' && path === '/requests') {
    return ok(null).pipe(delay(1500));
  }

  // POST /requests/:id/approve
  const approveReq = path.match(/^\/requests\/(\d+)\/approve$/);
  if (req.method === 'POST' && approveReq) {
    return ok(null);
  }

  // POST /requests/:id/actions
  const actionsReq = path.match(/^\/requests\/(\d+)\/actions$/);
  if (req.method === 'POST' && actionsReq) {
    return ok(null);
  }

  return next(req);
};
