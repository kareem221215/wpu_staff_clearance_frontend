import { UserRoleEnum } from '../enums/user-role.enum';
import { UserTypeEnum } from '../enums/user-type.enum';

export interface IAccessTokenPayload {
  readonly meta: Readonly<{ departmentId: number | null }>;
  readonly name: string;
  readonly roles: UserRoleEnum[];
  readonly sub: number;
  readonly type: UserTypeEnum;
  readonly username: string;
}
