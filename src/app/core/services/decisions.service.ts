import { inject, Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { DecisionView } from '../features/decision/view/view';

@Injectable({ providedIn: 'root' })
export class DecisionsService {
  readonly #dialogService = inject(DialogService);

  openViewDialog(decisionId: number) {
    this.#dialogService.open(DecisionView, {
      closable: false,
      closeOnEscape: true,
      dismissableMask: true,
      draggable: false,
      resizable: false,
      showHeader: false,
      width: '58rem',
      inputValues: { decisionId },
    });
  }
}
