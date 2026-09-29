import { UserStatusEnum } from '../../shared/enums/user-status.enum';
import { UserTypeEnum } from '../../shared/enums/user-type.enum';
import { UserRoleEnum } from '../../shared/enums/user-role.enum';

export interface IStaff {
  readonly name: string;
  readonly status: UserStatusEnum;
  readonly uid: string;
  readonly staffId: number;
  readonly hasRequest: boolean;
  readonly departmentName: string;
  readonly departmentAlias: string;
  readonly departmentId: number;
  readonly type: UserTypeEnum;
  readonly roles: UserRoleEnum[];
  readonly requestId?: number;
}
