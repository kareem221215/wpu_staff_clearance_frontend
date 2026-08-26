import { inject, Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { UserRoleEnum } from '../../shared/enums/user-role.enum';
import { AuthService } from '../../shared/services/auth.service';
// import { RequestReject } from '../components/request-reject/request-reject';
import { RequestsHttpService } from '../http-services/requests.http-service';
import { IRequest } from '../interfaces/request.interface';
import { IStaff } from '../interfaces/staff.interface';
import { ConfirmService } from './confirm.service';
import { ToastService } from './toast.service';

const HEADER_TEXT = 'الطلاب الاعزاء، نذكركم بوجوب استكمال الوثائق التالية في مدة لاتتجاوز الاسبوع.';
const FOOTER_TEXT = `مديرية شؤون الطلاب المركزية - الجامعة الوطنية الخاصة
شكراَ لتعاونكم`;

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
            this.#requestsHttpService.approve$(request.requestId).subscribe(() => {
              this.#toastService.success(`تمت الموافقة على الطلب #${request.requestId} بنجاح`);

              resolve();
            });
          }),
      );
  }

  // async reject(request: IRequest) {
  //   return new Promise<boolean>((resolve) => {
  //     const ref = this.#dialogService.open(RequestReject, {
  //       closeOnEscape: true,
  //       dismissableMask: true,
  //       draggable: false,
  //       resizable: false,
  //       showHeader: false,
  //       closable: true,
  //       inputValues: { request },
  //       width: '30rem',
  //     })!;

  //     ref.onClose.subscribe((note?: string) => {
  //       if (note === undefined || note === '') {
  //         resolve(false);

  //         return;
  //       }

  //       this.#requestsHttpService.approve$(request.requestId, false, note).subscribe(() => {
  //         this.#toastService.success(`تم رفض الطلب #${request.requestId} بنجاح`);

  //         resolve(true);
  //       });
  //     });
  //   });
  // }

  openViewDialog(request: IRequest) {
    return new Promise<boolean>((resolve) => {
      const ref = this.#dialogService.open(Request, {
        closeOnEscape: true,
        dismissableMask: true,
        draggable: false,
        resizable: false,
        showHeader: false,
        width: '48rem',
        closable: true,
        inputValues: { request },
      })!;

      ref.onClose.subscribe((payload: boolean) => {
        resolve(payload);
      });
    });
  }

  delete(evt: MouseEvent, request: IRequest) {
    return new Promise<void>((resolve) => {
      this.#confirmService
        .confirm(evt, `هل تريد بالفعل حذف الطلب #${request.requestId} نهائياً؟`)
        .then(() => {
          // this.#requestsHttpService.delete$(request.requestId).subscribe(() => {
          //   this.#toastService.success(`تم حذف الطلب #${request.requestId} بنجاح!`);
          //   resolve();
          // });
        });
    });
  }

  canTakeAction(request: IRequest) {
    return (
      request.nextApproverRole &&
      !request.completed &&
      this.#authService.accessTokenPayload!.roles.includes(request.nextApproverRole)
    );
  }

  // canCreate() {
  //   return this.#authService.accessTokenPayload!.roles.includes(UserRoleEnum.s);
  // }
  //to-do all staff can create

  canPrint() {
    return this.#authService.accessTokenPayload!.roles.includes(UserRoleEnum.HUMAN_RESOURCES);
  }
}
