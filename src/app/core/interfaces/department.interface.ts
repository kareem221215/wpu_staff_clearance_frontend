import { UserRoleEnum } from '../../shared/enums/user-role.enum';

export interface IDepartment {
  readonly alias: string;
  readonly departmentId: number;
  readonly directManagerId: number;
  readonly managerRoleAlias: UserRoleEnum;
  readonly name: string;
}
