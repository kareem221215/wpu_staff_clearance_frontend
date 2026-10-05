import { inject, Injectable } from '@angular/core';
import { UserRoleEnum } from '../../shared/enums/user-role.enum';
import { AuthService } from '../../shared/services/auth.service';
import { RequestActionTypeEnum } from '../enums/request-action-type.enum';
import { IRequest } from '../interfaces/request.interface';

@Injectable({ providedIn: 'root' })
export class RequestPolicyService {
  readonly #authService = inject(AuthService);

  canTakeAction(request: IRequest) {
    if (this.#authService.hasRoles([UserRoleEnum.ADMIN])) {
      return false;
    }

    const myActions = this.#getMyActions(request);

    if (myActions.length === 0 || this.#authService.hasRoles([UserRoleEnum.HR_STAFF])) {
      return true;
    }

    if (myActions[0].type === RequestActionTypeEnum.APPROVE) {
      return false;
    }

    return true;
  }

  canApprove(request: IRequest) {
    const myActions = this.#getMyActions(request);

    return !myActions.length || myActions[0].type !== RequestActionTypeEnum.APPROVE;
  }

  canReject(request: IRequest) {
    const myActions = this.#getMyActions(request);

    return !myActions.length;
  }

  canArchive(request: IRequest) {
    const myActions = this.#getMyActions(request);

    return (
      this.#authService.hasRoles([UserRoleEnum.HR_STAFF]) &&
      myActions.length === 1 &&
      myActions[0].type === RequestActionTypeEnum.APPROVE
    );
  }

  canPrint(request: IRequest) {
    const myActions = this.#getMyActions(request);

    return (
      this.#authService.hasRoles([UserRoleEnum.HR_STAFF]) &&
      myActions[0].type === RequestActionTypeEnum.APPROVE
    );
  }

  isCompleted(request: IRequest) {
    return (
      request.nextActionRole === null &&
      request.actions.every(({ type }) => type !== RequestActionTypeEnum.REJECT)
    );
  }

  #getMyActions(request: IRequest) {
    return request.actions.filter(({ role }) => this.#authService.hasRoles([role]));
  }
}
