import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly #messageService = inject(MessageService);

  success(message: string) {
    this.#messageService.add({
      closable: true,
      detail: message,
      severity: 'success',
      summary: 'نجاح',
    });
  }

  error(message: string) {
    this.#messageService.add({
      closable: true,
      detail: message,
      severity: 'error',
      summary: 'خطأ',
    });
  }
}
