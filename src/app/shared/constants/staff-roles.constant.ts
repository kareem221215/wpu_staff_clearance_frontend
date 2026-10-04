import { UserRoleEnum } from '../enums/user-role.enum';

// Roles that get the full nav (requests list, stats, etc.) in addition to
// the clearance page. Everyone else — plain department staff — only ever
// sees the clearance page, since that's the only thing relevant to them.
export const MANAGEMENT_ROLES = [
  UserRoleEnum.ACCOUNTING_MANAGER,
  UserRoleEnum.ACCOUNTING_STAFF_STAFF,
  UserRoleEnum.ADMIN,
  UserRoleEnum.AFFAIRS_MANAGER,
  UserRoleEnum.CENTRAL_LIBRARY_MANAGER,
  UserRoleEnum.COLLEGE_DEAN,
  UserRoleEnum.GRADUATE_TRACKING_MANAGER,
  UserRoleEnum.HR_STAFF,
  UserRoleEnum.IT_MANAGER,
  UserRoleEnum.STOREKEEPER,
];
