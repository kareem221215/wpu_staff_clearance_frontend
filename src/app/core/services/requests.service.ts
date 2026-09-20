import { inject, Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { UserRoleEnum } from '../../shared/enums/user-role.enum';
import { AuthService } from '../../shared/services/auth.service';
import { RequestReject } from '../features/request/reject/reject';
import { RequestActionTypeEnum } from '../enums/request-action-type.enum';
import { RequestsHttpService } from '../http-services/requests.http-service';
import { IRequest } from '../interfaces/request.interface';
import { IStaff } from '../interfaces/staff.interface';
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
      const ref = this.#dialogService.open(RequestView, {
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
    return this.#isNext(request) || (this.#isRejected(request) && !this.#isApproved(request));
  }

  canReject(request: IRequest) {
    return this.#isNext(request);
  }

  canArchive(request: IRequest) {
    return (
      this.isCompleted(request) &&
      request.actions.every(({ type }) => type !== RequestActionTypeEnum.ARCHIVE) &&
      this.#authService.hasRoles([UserRoleEnum.HUMAN_RESOURCES])
    );
  }

  canCreate() {
    return this.#authService.hasRoles([UserRoleEnum.IT_STAFF]);
  }
  //TO-DO change user role to all staffs

  canPrint(request: IRequest) {
    return this.isCompleted(request) && this.#authService.hasRoles([UserRoleEnum.HUMAN_RESOURCES]);
  }

  canView(request: IRequest) {
    return (
      this.isCompleted(request) ||
      this.#isNext(request) ||
      this.#isApproved(request) ||
      this.#isRejected(request)
    );
  }

  isCompleted(request: IRequest) {
    return (
      request.nextActionRole === null &&
      this.#getRejectionRoles(request).every((role) =>
        this.#getApprovalRoles(request).includes(role),
      )
    );
  }

  #isRejected(request: IRequest) {
    return this.#authService.hasRoles(this.#getRejectionRoles(request));
  }

  #isApproved(request: IRequest) {
    return this.#authService.hasRoles(this.#getApprovalRoles(request));
  }

  #isNext({ nextActionRole }: IRequest) {
    return nextActionRole && this.#authService.hasRoles([nextActionRole]);
  }

  #getApprovalRoles(request: IRequest) {
    return request.actions
      .filter((action) => action.type === RequestActionTypeEnum.APPROVE)
      .map(({ role }) => role);
  }

  #getRejectionRoles(request: IRequest) {
    return request.actions
      .filter((action) => action.type === RequestActionTypeEnum.REJECT)
      .map(({ role }) => role);
  }
}
