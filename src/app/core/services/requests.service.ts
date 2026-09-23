import { inject, Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { UserRoleEnum } from '../../shared/enums/user-role.enum';
import { STAFF_ROLES } from '../../shared/constants/staff-roles.constant';
import { AuthService } from '../../shared/services/auth.service';
import { RequestReject } from '../features/request/reject/reject';
import { RequestActionTypeEnum } from '../enums/request-action-type.enum';
import { RequestsHttpService } from '../http-services/requests.http-service';
import { IRequest } from '../interfaces/request.interface';
import { ConfirmService } from './confirm.service';
import { ToastService } from './toast.service';
import { RequestView } from '../features/request/view/view';

@Injectable({ providedIn: 'root' })
export class RequestsService {
  readonly #authService = inject(AuthService);
  readonly #confirmService = inject(ConfirmService);
  readonly #dialogService = inject(DialogService);
  readonly #requestsHttpService = inject(RequestsHttpService);
  readonly #toastService = inject(ToastService);

  async approve(evt: MouseEvent, request: IRequest) {
    return this.#confirmService
      .confirm(evt, `هل أنت متأكد من الموافقة على الطلب #${request.requestId}؟`)
      .then(
        () =>
          new Promise<void>((resolve) => {
            this.#requestsHttpService
              .takeAction$(request.requestId, RequestActionTypeEnum.APPROVE)
              .subscribe(() => {
                this.#toastService.success(`تمت الموافقة على الطلب #${request.requestId} بنجاح`);

                resolve();
              });
          }),
      );
  }

  async archive(evt: MouseEvent, request: IRequest) {
    return this.#confirmService
      .confirm(evt, `هل أنت متأكد من أرشفة الطلب #${request.requestId}؟`)
      .then(
        () =>
          new Promise<void>((resolve) => {
            this.#requestsHttpService
              .takeAction$(request.requestId, RequestActionTypeEnum.ARCHIVE)
              .subscribe(() => {
                this.#toastService.success(`تمت أرشفة الطلب #${request.requestId} بنجاح`);

                resolve();
              });
          }),
      );
  }

  async reject(request: IRequest) {
    return new Promise<boolean>((resolve) => {
      const ref = this.#dialogService.open(RequestReject, {
        closeOnEscape: true,
        dismissableMask: true,
        draggable: false,
        resizable: false,
        showHeader: false,
        closable: true,
        inputValues: { request },
        width: '30rem',
      })!;

      ref.onClose.subscribe((note?: string) => {
        if (note === undefined || note === '') {
          resolve(false);

          return;
        }

        this.#requestsHttpService
          .takeAction$(request.requestId, RequestActionTypeEnum.REJECT, note)
          .subscribe(() => {
            this.#toastService.success(`تم رفض الطلب #${request.requestId} بنجاح`);

            resolve(true);
          });
      });
    });
  }

  openViewDialog(requestId: number) {
    return new Promise<boolean>((resolve) => {
      const ref = this.#dialogService.open(DecisionView, {
        closeOnEscape: true,
        dismissableMask: true,
        draggable: false,
        resizable: false,
        showHeader: false,
        width: '48rem',
        closable: true,
        inputValues: { requestId },
      })!;

      ref.onClose.subscribe((payload: boolean) => {
        resolve(payload);
      });
    });
  }

  canApprove(request: IRequest) {
    return this.#isMyTurn(request);
  }

  canReject(request: IRequest) {
    return this.#isMyTurn(request);
  }

  canArchive(request: IRequest) {
    return (
      this.isCompleted(request) &&
      !request.archivedAt &&
      this.#authService.hasRoles([UserRoleEnum.HUMAN_RESOURCES])
    );
  }

  canCreate() {
    return this.#authService.hasRoles(STAFF_ROLES);
  }

  canPrint(request: IRequest) {
    return (
      this.#authService.hasRoles([UserRoleEnum.HUMAN_RESOURCES]) &&
      (this.isCompleted(request) || this.#isMyTurn(request))
    );
  }

  canView(request: IRequest) {
    return this.isCompleted(request) || this.canApprove(request);
  }

  isCompleted(request: IRequest) {
    return request.nextApproverStaffId === null;
  }

  #isMyTurn({ nextApproverStaffId }: IRequest) {
    return nextApproverStaffId !== null && nextApproverStaffId === this.#authService.staffId;
  }
}
