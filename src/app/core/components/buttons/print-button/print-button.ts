import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Print } from '@primeicons/angular/print';
import { ButtonDirective } from 'primeng/button';
import { IRequest } from '../../../interfaces/request.interface';
import { RequestPolicyService } from '../../../services/request-policy.service';

@Component({
  imports: [ButtonDirective, Print, RouterLink],
  selector: 'app-print-button',
  styles: ':host { display: contents; }',
  templateUrl: './print-button.html',
})
export class PrintButton {
  readonly #requestPolicyService = inject(RequestPolicyService);

  readonly request = input.required<IRequest>();

  protected readonly canPrint = computed(() => {
    return this.#requestPolicyService.canPrint(this.request());
  });
}
