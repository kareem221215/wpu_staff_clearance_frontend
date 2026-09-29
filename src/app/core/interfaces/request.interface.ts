export interface IRequest {
  readonly approvedCount: number;
  readonly archivedAt: Date | null;
  readonly departmentName: string;
  readonly completed: boolean;
  readonly directManagerId: number;
  readonly directManagerName: string;
  readonly nextApproverStaffId: number | null;
  readonly requestId: number;
  readonly staffId: number;
  readonly staffName: string;
}
