import { UserStatusEnum } from '../../shared/enums/user-status.enum';

export interface IStaff {
  readonly name: string;
  readonly status: UserStatusEnum;
  readonly uid: string;
  readonly staffId: number;
  readonly hasRequest: boolean;
  readonly collegeName: string;
  readonly collegeAlias: string;
  readonly collegeId: number;
}
