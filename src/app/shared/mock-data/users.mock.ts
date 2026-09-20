import { UserRoleEnum } from '../enums/user-role.enum';
import { UserStatusEnum } from '../enums/user-status.enum';
import { UserTypeEnum } from '../enums/user-type.enum';
import { IStaff } from '../../core/interfaces/staff.interface';

// export interface IMockUser {
//   readonly sub: number;
//   readonly name: string;
//   readonly username: string;
//   readonly type: UserTypeEnum;
//   readonly roles: UserRoleEnum[];
// }

// ─── Staff ───────────────────────────────────────────────────────────────────

export const STAFF: IStaff[] = [
  {
    staffId: 1,
    name: 'محمد رئيف الرفاعي',
    uid: 'ST-2024-001',
    status: UserStatusEnum.ACTIVE,
    hasRequest: false,
    collegeName: 'كلية الصيدلة',
    collegeAlias: 'pharmacy',
    collegeId: 1,
    type: UserTypeEnum.STAFF,
    roles: [UserRoleEnum.IT_STAFF],
  },
  {
    staffId: 2,
    name: 'سارة عبدالله الحربي',
    uid: 'ST-2024-002',
    status: UserStatusEnum.ACTIVE,
    hasRequest: true,
    collegeName: 'كلية تقنية المعلومات',
    collegeAlias: 'it',
    collegeId: 2,
    type: UserTypeEnum.STAFF,
    roles: [UserRoleEnum.IT_STAFF],
  },
  {
    staffId: 3,
    name: 'أحمد خالد المطيري',
    uid: 'ST-2024-003',
    status: UserStatusEnum.INACTIVE,
    hasRequest: false,
    collegeName: 'كلية الهندسة المعمارية',
    collegeAlias: 'architecture',
    collegeId: 3,
    type: UserTypeEnum.STAFF,
    roles: [UserRoleEnum.IT_STAFF],
  },
  {
    staffId: 4,
    name: 'فاطمة يوسف العمري',
    uid: 'ST-2024-004',
    status: UserStatusEnum.ACTIVE,
    hasRequest: false,
    collegeName: 'كلية طب الأسنان',
    collegeAlias: 'dentistry',
    collegeId: 4,
    type: UserTypeEnum.STAFF,
    roles: [UserRoleEnum.IT_STAFF],
  },
  {
    staffId: 5,
    name: 'عمر سعد القحطاني',
    uid: 'ST-2024-005',
    status: UserStatusEnum.ACTIVE,
    hasRequest: true,
    collegeName: 'كلية الهندسة المدنية',
    collegeAlias: 'civil_engineering',
    collegeId: 5,
    type: UserTypeEnum.STAFF,
    roles: [UserRoleEnum.IT_STAFF],
  },
];

// ─── Direct Managers ─────────────────────────────────────────────────────────

export const DIRECT_MANAGERS: IStaff[] = [
  {
    staffId: 101,
    uid: 'ST-2024-006',
    status: UserStatusEnum.ACTIVE,
    hasRequest: true,
    collegeName: 'كلية الهندسة المدنية',
    collegeAlias: 'civil_engineering',
    collegeId: 5,
    name: 'direct manager civil',
    type: UserTypeEnum.STAFF,
    roles: [UserRoleEnum.DIRECT_MANAGERS],
  },
  {
    staffId: 102,
    uid: 'ST-2024-007',
    status: UserStatusEnum.ACTIVE,
    hasRequest: true,
    collegeName: 'كلية الهندسة المعمارية',
    collegeAlias: 'architecture',
    collegeId: 3,
    name: 'direct manager architecture',
    type: UserTypeEnum.STAFF,
    roles: [UserRoleEnum.DIRECT_MANAGERS],
  },
  {
    staffId: 103,
    uid: 'ST-2024-008',
    status: UserStatusEnum.ACTIVE,
    hasRequest: true,
    collegeName: 'كلية طب الأسنان',
    collegeAlias: 'dentistry',
    collegeId: 4,
    name: 'direct dentistry manager',
    type: UserTypeEnum.STAFF,
    roles: [UserRoleEnum.DIRECT_MANAGERS],
  },
];

// ─── Managers ─────────────────────────────────────────────────────────────────

export const MANAGERS: IStaff[] = [
  {
    staffId: 201,
    uid: 'ST-2024-009',
    status: UserStatusEnum.ACTIVE,
    hasRequest: true,
    collegeName: 'كلية طب الأسنان',
    collegeAlias: 'dentistry',
    collegeId: 4,
    name: 'أ.د. سلطان علي العتيبي',
    type: UserTypeEnum.STAFF,
    roles: [UserRoleEnum.MANAGERS],
  },
  {
    staffId: 202,
    uid: 'ST-2024-010',
    status: UserStatusEnum.ACTIVE,
    hasRequest: true,
    collegeName: 'كلية طب الأسنان',
    collegeAlias: 'dentistry',
    collegeId: 4,
    name: 'أ.د. منى عبدالعزيز الزهراني',
    type: UserTypeEnum.STAFF,
    roles: [UserRoleEnum.MANAGERS],
  },
  {
    staffId: 203,
    uid: 'ST-2024-011',
    status: UserStatusEnum.ACTIVE,
    hasRequest: true,
    collegeName: 'كلية طب الأسنان',
    collegeAlias: 'dentistry',
    collegeId: 4,
    name: 'أ.د. ياسر تركي البلوي',
    type: UserTypeEnum.STAFF,
    roles: [UserRoleEnum.MANAGERS, UserRoleEnum.HUMAN_RESOURCES],
  },
];
