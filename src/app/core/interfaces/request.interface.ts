import { UserRoleEnum } from '../../shared/enums/user-role.enum';

export interface IRequest {
  readonly approvalCount: number;
  readonly completed: boolean;
  readonly nextApproverRole: UserRoleEnum | null;
  readonly requestId: number;
  readonly stafftId: number;
  readonly staffName: string;
}
