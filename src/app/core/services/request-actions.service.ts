import { inject, Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { RequestActionTypeEnum } from '../enums/request-action-type.enum';
import { RequestReject } from '../features/request/reject/reject';
import { RequestsHttpService } from '../http-services/requests.http-service';
import { IRequest } from '../interfaces/request.interface';
import { ConfirmService } from './confirm.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class RequestActionsService {
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
}
