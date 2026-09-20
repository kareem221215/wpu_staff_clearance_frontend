import { UserRoleEnum } from '../../shared/enums/user-role.enum';
import { IRequestAction } from './request-action.interface';

export interface IRequest {
  readonly approval: number;
  readonly completed: boolean;
  readonly nextActionRole: UserRoleEnum | null;
  readonly requestId: number;
  readonly staffId: number;
  readonly staffName: string;
  readonly managerId: number;
  readonly managerName: string;
  readonly directManagerId: number;
  readonly directManagerName: string;
  readonly collegeName: string;
  readonly actions: IRequestAction[];
}
