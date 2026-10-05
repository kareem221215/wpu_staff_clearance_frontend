import { UserRoleEnum } from '../../shared/enums/user-role.enum';
import { RequestActionTypeEnum } from '../enums/request-action-type.enum';

export interface IRequestAction {
  readonly note: string | null;
  readonly requestActionId: number;
  readonly requestId: number;
  readonly role: UserRoleEnum;
  readonly takenAt: Date;
  readonly takenById: number;
  readonly takenByName: string;
  readonly type: RequestActionTypeEnum;
}
