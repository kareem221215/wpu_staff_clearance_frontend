import { Component, inject, input, OnInit, signal } from '@angular/core';
import { ExclamationTriangle } from '@primeicons/angular/exclamation-triangle';
import { Spinner } from '@primeicons/angular/spinner';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Message } from 'primeng/message';
import { finalize, tap } from 'rxjs';
import { DialogContainer } from '../../../../shared/components/dialog-container/dialog-container';
import {
  IRequestListFilters,
  RequestListTable,
} from '../../../components/request-list/request-list';
import { DecisionsHttpService } from '../../../http-services/decisions.http-service';
import { IDecision } from '../../../interfaces/decision.interface';

@Component({
  templateUrl: './view.html',
  imports: [DialogContainer, ExclamationTriangle, Message, Spinner, RequestListTable],
  styles: ':host { display: contents; }',
})
export class DecisionView implements OnInit {
  readonly #ref = inject(DynamicDialogRef);
  readonly #decisionsHttpService = inject(DecisionsHttpService);

  readonly decisionId = input.required<number>();

  readonly loading = signal(true);
  readonly decision = signal<IDecision | null>(null);
  readonly requestListFilters = signal<IRequestListFilters>({
    departmentId: null,
    skip: 0,
    staffId: null,
  });

  ngOnInit(): void {
    this.#decisionsHttpService
      .fetchById$(this.decisionId())
      .pipe(
        tap(({ data }) => {
          this.decision.set(data);
          this.requestListFilters.set({ ...this.requestListFilters(), departmentId: data.departmentId });
        }),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe();
  }

  close() {
    this.#ref.close();
  }
}
