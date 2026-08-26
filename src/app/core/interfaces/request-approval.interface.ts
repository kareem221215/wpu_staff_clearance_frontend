export interface IRequestApproval {
  readonly approved: boolean;
  readonly createdAt: Date;
  readonly note: string | null;
  readonly requestApprovalId: number;
  readonly requestId: number;
  readonly staffId: number;
  readonly staffName: string;
}
