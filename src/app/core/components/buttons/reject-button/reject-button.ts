import { Component, computed, inject, input, output } from '@angular/core';
import { TimesCircle } from '@primeicons/angular/times-circle';
import { ButtonDirective } from 'primeng/button';
import { IRequest } from '../../../interfaces/request.interface';
import { RequestActionsService } from '../../../services/request-actions.service';
import { RequestPolicyService } from '../../../services/request-policy.service';

@Component({
  imports: [ButtonDirective, TimesCircle],
  selector: 'app-reject-button',
  styles: ':host { display: contents; }',
  templateUrl: './reject-button.html',
})
export class RejectButton {
  readonly #requestActionsService = inject(RequestActionsService);
  readonly #requestPolicyService = inject(RequestPolicyService);

  readonly request = input.required<IRequest>();

  readonly onReject = output<boolean>();

  protected readonly canReject = computed(() => {
    return this.#requestPolicyService.canReject(this.request());
  });

  reject() {
    this.#requestActionsService.reject(this.request()).then(() => {
      this.onReject.emit(true);
    });
  }
}
