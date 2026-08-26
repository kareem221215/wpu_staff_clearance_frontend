import { inject, Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly #confirmationService = inject(ConfirmationService);

  confirm(evt: MouseEvent, message: string) {
    return new Promise<void>((resolve, reject) => {
      this.#confirmationService.confirm({
        acceptLabel: 'نعم',
        rejectLabel: 'لا',
        message,
        icon: 'pi pi-exclamation-circle',
        target: evt.target as EventTarget,
        rejectButtonProps: {
          severity: 'secondary',
        },
        acceptButtonProps: {
          severity: 'danger',
        },
        accept: () => {
          resolve();
        },
        reject: () => {
          reject();
        },
      });
    });
  }
}
