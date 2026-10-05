import { Component, computed, inject, input, output } from '@angular/core';
import { CheckCircle } from '@primeicons/angular/check-circle';
import { ButtonDirective } from 'primeng/button';
import { IRequest } from '../../../interfaces/request.interface';
import { RequestActionsService } from '../../../services/request-actions.service';
import { RequestPolicyService } from '../../../services/request-policy.service';

@Component({
  imports: [ButtonDirective, CheckCircle],
  selector: 'app-approve-button',
  styles: ':host { display: contents; }',
  templateUrl: './approve-button.html',
})
export class ApproveButton {
  readonly #requestActionsService = inject(RequestActionsService);
  readonly #requestPolicyService = inject(RequestPolicyService);

  readonly request = input.required<IRequest>();

  readonly onApprove = output<boolean>();

  protected readonly canApprove = computed(() => {
    return this.#requestPolicyService.canApprove(this.request());
  });

  approve(evt: MouseEvent) {
    this.#requestActionsService.approve(evt, this.request()).then(() => {
      this.onApprove.emit(true);
    });
  }
}
