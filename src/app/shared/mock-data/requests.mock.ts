import { RequestApprovalStatusEnum } from '../../core/enums/request-approval-status.enum';
import { IRequest } from '../../core/interfaces/request.interface';
import { IRequestApproval } from '../../core/interfaces/request-approval.interface';
import { DIRECT_MANAGERS, MANAGERS } from './users.mock';

// One request per stage of the pipeline, so every state is exercisable
// locally without a backend: not started (staffId 3 has none at all),
// rejected right at the direct manager, early / mid progress through the 6
// fixed managers, rejected mid-chain, waiting on HR (the last of the 7),
// completed-but-not-archived, and completed-and-archived.
export const REQUESTS: IRequest[] = [
  // Pharmacy staff — direct manager approved, now waiting on the first fixed manager (library).
  {
    requestId: 1001,
    staffId: 1,
    staffName: 'محمد رئيف الرفاعي',
    directManagerId: 101,
    directManagerName: 'د. خالد إبراهيم السعيد',
    collegeName: 'كلية الصيدلة',
    approvedCount: 1,
    completed: false,
    archivedAt: null,
    nextApproverStaffId: 201,
  },
  // IT staff — direct manager rejected once; the request stays with them so they can reconsider.
  {
    requestId: 1002,
    staffId: 2,
    staffName: 'سارة عبدالله الحربي',
    directManagerId: 102,
    directManagerName: 'د. نورة محمد الشمري',
    collegeName: 'كلية تقنية المعلومات',
    approvedCount: 0,
    completed: false,
    archivedAt: null,
    nextApproverStaffId: 102,
  },
  // Civil engineering staff — every one of the 7 signed off, and it's been archived by HR.
  {
    requestId: 1003,
    staffId: 5,
    staffName: 'عمر سعد القحطاني',
    directManagerId: 105,
    directManagerName: 'م. فيصل ناصر العنزي',
    collegeName: 'كلية الهندسة المدنية',
    approvedCount: 7,
    completed: true,
    archivedAt: new Date('2026-08-26T09:00:00'),
    nextApproverStaffId: null,
  },
  // Dentistry staff — halfway through: direct manager + library + finance approved, payroll's turn.
  {
    requestId: 1004,
    staffId: 4,
    staffName: 'فاطمة يوسف العمري',
    directManagerId: 104,
    directManagerName: 'د. لمى سعود القرني',
    collegeName: 'كلية طب الأسنان',
    approvedCount: 3,
    completed: false,
    archivedAt: null,
    nextApproverStaffId: 203,
  },
  // Pharmacy staff — every one of the 7 signed off, ready to be printed/archived (not archived yet).
  {
    requestId: 1005,
    staffId: 6,
    staffName: 'ريم فهد العصيمي',
    directManagerId: 101,
    directManagerName: 'د. خالد إبراهيم السعيد',
    collegeName: 'كلية الصيدلة',
    approvedCount: 7,
    completed: true,
    archivedAt: null,
    nextApproverStaffId: null,
  },
  // IT staff — the 6 fixed managers are all done except HR, who can now approve or print.
  {
    requestId: 1006,
    staffId: 7,
    staffName: 'ماجد سالم القحطاني',
    directManagerId: 102,
    directManagerName: 'د. نورة محمد الشمري',
    collegeName: 'كلية تقنية المعلومات',
    approvedCount: 6,
    completed: false,
    archivedAt: null,
    nextApproverStaffId: 206,
  },
  // Civil engineering staff — the finance manager rejected mid-chain; stays with them to reconsider.
  {
    requestId: 1007,
    staffId: 8,
    staffName: 'هيا عبدالله الشهري',
    directManagerId: 105,
    directManagerName: 'م. فيصل ناصر العنزي',
    collegeName: 'كلية الهندسة المدنية',
    approvedCount: 2,
    completed: false,
    archivedAt: null,
    nextApproverStaffId: 202,
  },
];

// Each approver's own office/college name, for the "اسم المديرية / الكلية"
// print column — e.g. the library manager's row prints "المكتبة المركزية".
const DEPARTMENT_NAME_BY_STAFF_ID = new Map(
  [...DIRECT_MANAGERS, ...MANAGERS].map((manager) => [manager.staffId, manager.collegeName]),
);

function buildChain(
  requestId: number,
  startId: number,
  rows: {
    staffId: number;
    staffName: string;
    status: RequestApprovalStatusEnum;
    note?: string | null;
    decidedAt?: Date | null;
  }[],
): { approvals: IRequestApproval[]; nextId: number } {
  const approvals = rows.map((row, index) => ({
    requestApprovalId: startId + index,
    requestId,
    order: index + 1,
    staffId: row.staffId,
    staffName: row.staffName,
    departmentName: DEPARTMENT_NAME_BY_STAFF_ID.get(row.staffId) ?? '',
    status: row.status,
    note: row.note ?? null,
    decidedAt: row.decidedAt ?? null,
  }));

  return { approvals, nextId: startId + rows.length };
}

const { PENDING, APPROVED, REJECTED } = RequestApprovalStatusEnum;

let nextApprovalId = 1;
const chains: IRequestApproval[][] = [];

let built = buildChain(1001, nextApprovalId, [
  {
    staffId: 101,
    staffName: 'د. خالد إبراهيم السعيد',
    status: APPROVED,
    decidedAt: new Date('2026-08-20T09:00:00'),
  },
  { staffId: 201, staffName: 'أ.د. سلطان علي العتيبي', status: PENDING },
  { staffId: 202, staffName: 'أ.د. منى عبدالعزيز الزهراني', status: PENDING },
  { staffId: 203, staffName: 'أ. ياسر تركي البلوي', status: PENDING },
  { staffId: 204, staffName: 'م. بندر سعد الغامدي', status: PENDING },
  { staffId: 205, staffName: 'أ. طارق فهد الحربي', status: PENDING },
  { staffId: 206, staffName: 'أ.د. هند خالد المالكي', status: PENDING },
]);
chains.push(built.approvals);
nextApprovalId = built.nextId;

built = buildChain(1002, nextApprovalId, [
  {
    staffId: 102,
    staffName: 'د. نورة محمد الشمري',
    status: REJECTED,
    note: 'يرجى مراجعة الوثائق',
    decidedAt: new Date('2026-08-22T14:00:00'),
  },
  { staffId: 201, staffName: 'أ.د. سلطان علي العتيبي', status: PENDING },
  { staffId: 202, staffName: 'أ.د. منى عبدالعزيز الزهراني', status: PENDING },
  { staffId: 203, staffName: 'أ. ياسر تركي البلوي', status: PENDING },
  { staffId: 204, staffName: 'م. بندر سعد الغامدي', status: PENDING },
  { staffId: 205, staffName: 'أ. طارق فهد الحربي', status: PENDING },
  { staffId: 206, staffName: 'أ.د. هند خالد المالكي', status: PENDING },
]);
chains.push(built.approvals);
nextApprovalId = built.nextId;

built = buildChain(1003, nextApprovalId, [
  {
    staffId: 105,
    staffName: 'م. فيصل ناصر العنزي',
    status: APPROVED,
    decidedAt: new Date('2026-08-23T08:45:00'),
  },
  {
    staffId: 201,
    staffName: 'أ.د. سلطان علي العتيبي',
    status: APPROVED,
    decidedAt: new Date('2026-08-23T13:00:00'),
  },
  {
    staffId: 202,
    staffName: 'أ.د. منى عبدالعزيز الزهراني',
    status: APPROVED,
    decidedAt: new Date('2026-08-24T09:00:00'),
  },
  {
    staffId: 203,
    staffName: 'أ. ياسر تركي البلوي',
    status: APPROVED,
    decidedAt: new Date('2026-08-24T10:15:00'),
  },
  {
    staffId: 204,
    staffName: 'م. بندر سعد الغامدي',
    status: APPROVED,
    decidedAt: new Date('2026-08-24T15:30:00'),
  },
  {
    staffId: 205,
    staffName: 'أ. طارق فهد الحربي',
    status: APPROVED,
    decidedAt: new Date('2026-08-25T08:00:00'),
  },
  {
    staffId: 206,
    staffName: 'أ.د. هند خالد المالكي',
    status: APPROVED,
    decidedAt: new Date('2026-08-25T13:00:00'),
  },
]);
chains.push(built.approvals);
nextApprovalId = built.nextId;

built = buildChain(1004, nextApprovalId, [
  {
    staffId: 104,
    staffName: 'د. لمى سعود القرني',
    status: APPROVED,
    decidedAt: new Date('2026-09-01T09:00:00'),
  },
  {
    staffId: 201,
    staffName: 'أ.د. سلطان علي العتيبي',
    status: APPROVED,
    decidedAt: new Date('2026-09-01T14:00:00'),
  },
  {
    staffId: 202,
    staffName: 'أ.د. منى عبدالعزيز الزهراني',
    status: APPROVED,
    decidedAt: new Date('2026-09-02T10:30:00'),
  },
  { staffId: 203, staffName: 'أ. ياسر تركي البلوي', status: PENDING },
  { staffId: 204, staffName: 'م. بندر سعد الغامدي', status: PENDING },
  { staffId: 205, staffName: 'أ. طارق فهد الحربي', status: PENDING },
  { staffId: 206, staffName: 'أ.د. هند خالد المالكي', status: PENDING },
]);
chains.push(built.approvals);
nextApprovalId = built.nextId;

built = buildChain(1005, nextApprovalId, [
  {
    staffId: 101,
    staffName: 'د. خالد إبراهيم السعيد',
    status: APPROVED,
    decidedAt: new Date('2026-08-27T09:00:00'),
  },
  {
    staffId: 201,
    staffName: 'أ.د. سلطان علي العتيبي',
    status: APPROVED,
    decidedAt: new Date('2026-08-27T11:00:00'),
  },
  {
    staffId: 202,
    staffName: 'أ.د. منى عبدالعزيز الزهراني',
    status: APPROVED,
    decidedAt: new Date('2026-08-27T13:00:00'),
  },
  {
    staffId: 203,
    staffName: 'أ. ياسر تركي البلوي',
    status: APPROVED,
    decidedAt: new Date('2026-08-28T09:00:00'),
  },
  {
    staffId: 204,
    staffName: 'م. بندر سعد الغامدي',
    status: APPROVED,
    decidedAt: new Date('2026-08-28T11:00:00'),
  },
  {
    staffId: 205,
    staffName: 'أ. طارق فهد الحربي',
    status: APPROVED,
    decidedAt: new Date('2026-08-28T15:00:00'),
  },
  {
    staffId: 206,
    staffName: 'أ.د. هند خالد المالكي',
    status: APPROVED,
    decidedAt: new Date('2026-08-29T10:00:00'),
  },
]);
chains.push(built.approvals);
nextApprovalId = built.nextId;

built = buildChain(1006, nextApprovalId, [
  {
    staffId: 102,
    staffName: 'د. نورة محمد الشمري',
    status: APPROVED,
    decidedAt: new Date('2026-09-03T09:00:00'),
  },
  {
    staffId: 201,
    staffName: 'أ.د. سلطان علي العتيبي',
    status: APPROVED,
    decidedAt: new Date('2026-09-03T11:00:00'),
  },
  {
    staffId: 202,
    staffName: 'أ.د. منى عبدالعزيز الزهراني',
    status: APPROVED,
    decidedAt: new Date('2026-09-03T14:00:00'),
  },
  {
    staffId: 203,
    staffName: 'أ. ياسر تركي البلوي',
    status: APPROVED,
    decidedAt: new Date('2026-09-04T09:00:00'),
  },
  {
    staffId: 204,
    staffName: 'م. بندر سعد الغامدي',
    status: APPROVED,
    decidedAt: new Date('2026-09-04T11:00:00'),
  },
  {
    staffId: 205,
    staffName: 'أ. طارق فهد الحربي',
    status: APPROVED,
    decidedAt: new Date('2026-09-04T15:00:00'),
  },
  { staffId: 206, staffName: 'أ.د. هند خالد المالكي', status: PENDING },
]);
chains.push(built.approvals);
nextApprovalId = built.nextId;

built = buildChain(1007, nextApprovalId, [
  {
    staffId: 105,
    staffName: 'م. فيصل ناصر العنزي',
    status: APPROVED,
    decidedAt: new Date('2026-09-05T09:00:00'),
  },
  {
    staffId: 201,
    staffName: 'أ.د. سلطان علي العتيبي',
    status: APPROVED,
    decidedAt: new Date('2026-09-05T11:00:00'),
  },
  {
    staffId: 202,
    staffName: 'أ.د. منى عبدالعزيز الزهراني',
    status: REJECTED,
    note: 'يوجد التزامات مالية غير مسددة',
    decidedAt: new Date('2026-09-05T14:00:00'),
  },
  { staffId: 203, staffName: 'أ. ياسر تركي البلوي', status: PENDING },
  { staffId: 204, staffName: 'م. بندر سعد الغامدي', status: PENDING },
  { staffId: 205, staffName: 'أ. طارق فهد الحربي', status: PENDING },
  { staffId: 206, staffName: 'أ.د. هند خالد المالكي', status: PENDING },
]);
chains.push(built.approvals);
nextApprovalId = built.nextId;

export const APPROVALS: IRequestApproval[] = chains.flat();
