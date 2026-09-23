import { RequestApprovalStatusEnum } from '../enums/request-approval-status.enum';

export interface IRequestApproval {
  readonly decidedAt: Date | null;
  readonly departmentName: string;
  readonly note: string | null;
  readonly order: number;
  readonly requestApprovalId: number;
  readonly requestId: number;
  readonly staffId: number;
  readonly staffName: string;
  readonly status: RequestApprovalStatusEnum;
}
