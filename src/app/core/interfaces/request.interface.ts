import { UserRoleEnum } from '../../shared/enums/user-role.enum';
import { IRequestAction } from './request-action.interface';

export interface IRequest {
  readonly actions: IRequestAction[];
  readonly archived: boolean;
  readonly createdAt: string;
  readonly departmentId: number;
  readonly departmentName: string;
  readonly employeeId: number;
  readonly employeeName: string;
  readonly nextActionRole: UserRoleEnum | null;
  readonly requestId: number;
  readonly updatedAt: string;
}
