import { inject, Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { RequestViewDialog } from '../components/request-view-dialog/request-view-dialog';
import { IRequest } from '../interfaces/request.interface';

@Injectable({ providedIn: 'root' })
export class RequestsService {
  readonly #dialogService = inject(DialogService);

  openViewDialog(request: IRequest) {
    return new Promise<boolean>((resolve) => {
      const ref = this.#dialogService.open(RequestViewDialog, {
        closeOnEscape: true,
        dismissableMask: true,
        draggable: false,
        resizable: false,
        showHeader: false,
        width: '48rem',
        closable: true,
        inputValues: { requestId: request.requestId },
      })!;

      ref.onClose.subscribe((payload: boolean) => {
        resolve(payload);
      });
    });
  }
}
