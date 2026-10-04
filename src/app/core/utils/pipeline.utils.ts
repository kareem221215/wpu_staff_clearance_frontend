import { UserRoleEnum } from '../../shared/enums/user-role.enum';
import { RequestActionTypeEnum } from '../enums/request-action-type.enum';
import { RequestApprovalStatusEnum } from '../enums/request-approval-status.enum';
import { IRequestApproval } from '../interfaces/request-approval.interface';
import { IRequest } from '../interfaces/request.interface';

export const PIPELINE_ORDER: UserRoleEnum[] = [
  UserRoleEnum.STOREKEEPER,
  UserRoleEnum.IT_MANAGER,
  UserRoleEnum.ACCOUNTING_STAFF_STAFF,
  UserRoleEnum.ACCOUNTING_MANAGER,
  UserRoleEnum.CENTRAL_LIBRARY_MANAGER,
  UserRoleEnum.HR_STAFF,
];

export const ROLE_LABEL: Record<string, string> = {
  [UserRoleEnum.STOREKEEPER]: 'أمين المستودع',
  [UserRoleEnum.IT_MANAGER]: 'مدير تقنية المعلومات',
  [UserRoleEnum.ACCOUNTING_STAFF_STAFF]: 'محاسبة الموظفين',
  [UserRoleEnum.ACCOUNTING_MANAGER]: 'مدير المحاسبة',
  [UserRoleEnum.CENTRAL_LIBRARY_MANAGER]: 'مدير المكتبة المركزية',
  [UserRoleEnum.HR_STAFF]: 'الموارد البشرية',
};

export function deriveApprovals(request: IRequest): IRequestApproval[] {
  const DIRECT_MANAGER_LABEL = 'المدير المباشر';

  const nonArchiveActions = request.actions.filter((a) => a.type !== RequestActionTypeEnum.ARCHIVE);

  const dmAction = nonArchiveActions.find((a) => !PIPELINE_ORDER.includes(a.role));
  const pipelineActions = nonArchiveActions.filter((a) => a !== dmAction);

  let dmStatus: RequestApprovalStatusEnum;
  if (dmAction?.type === RequestActionTypeEnum.APPROVE) {
    dmStatus = RequestApprovalStatusEnum.APPROVED;
  } else if (dmAction?.type === RequestActionTypeEnum.REJECT) {
    dmStatus = RequestApprovalStatusEnum.REJECTED;
  } else {
    dmStatus = RequestApprovalStatusEnum.PENDING;
  }

  const directManagerStep: IRequestApproval = {
    requestApprovalId: 0,
    requestId: request.requestId,
    order: 1,
    staffId: dmAction?.takenById ?? 0,
    staffName: dmAction?.takenByName ?? DIRECT_MANAGER_LABEL,
    departmentName: DIRECT_MANAGER_LABEL,
    status: dmStatus,
    note: dmAction?.note ?? null,
    decidedAt: dmAction ? new Date(dmAction.takenAt) : null,
  };

  const pipelineSteps = PIPELINE_ORDER.map((role, index) => {
    const action = pipelineActions.find((a) => a.role === role);

    let status: RequestApprovalStatusEnum;
    if (action?.type === RequestActionTypeEnum.APPROVE) {
      status = RequestApprovalStatusEnum.APPROVED;
    } else if (action?.type === RequestActionTypeEnum.REJECT) {
      status = RequestApprovalStatusEnum.REJECTED;
    } else {
      status = RequestApprovalStatusEnum.PENDING;
    }

    return {
      requestApprovalId: index + 2,
      requestId: request.requestId,
      order: index + 2,
      staffId: action?.takenById ?? 0,
      staffName: action?.takenByName ?? ROLE_LABEL[role],
      departmentName: ROLE_LABEL[role],
      status,
      note: action?.note ?? null,
      decidedAt: action ? new Date(action.takenAt) : null,
    };
  });

  return [directManagerStep, ...pipelineSteps];
}
