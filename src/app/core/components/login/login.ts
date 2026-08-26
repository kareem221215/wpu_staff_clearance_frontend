import { Component, inject } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';
import { SignIn } from '@primeicons/angular/sign-in';
import { GATE_FRONTEND_SERVICE_URL_TOKEN } from '../../../shared/tokens/gate-frontend-service-url.token';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [Card, ButtonDirective, SignIn],
})
export class Login {
  readonly #gateFrontendServiceUrl = inject(GATE_FRONTEND_SERVICE_URL_TOKEN);

  getAuthHref() {
    return `${this.#gateFrontendServiceUrl}?action=login&redirect_to=${window.location.href}`;
  }
}
