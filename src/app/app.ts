import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLinkWithHref, RouterOutlet } from '@angular/router';
import { AngleLeft } from '@primeicons/angular/angle-left';
import { Book } from '@primeicons/angular/book';
import { ExternalLink } from '@primeicons/angular/external-link';
import { Facebook } from '@primeicons/angular/facebook';
import { Instagram } from '@primeicons/angular/instagram';
import { Linkedin } from '@primeicons/angular/linkedin';
import { SignIn } from '@primeicons/angular/sign-in';
import { SignOut } from '@primeicons/angular/sign-out';
import { Twitter } from '@primeicons/angular/twitter';
import { Youtube } from '@primeicons/angular/youtube';
import { ButtonDirective } from 'primeng/button';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { Toast } from 'primeng/toast';
import { AuthService } from './shared/services/auth.service';
import { GATE_FRONTEND_SERVICE_URL_TOKEN } from './shared/tokens/gate-frontend-service-url.token';

@Component({
  selector: 'app-root',
  imports: [
    AngleLeft,
    Book,
    ButtonDirective,
    ConfirmPopup,
    ExternalLink,
    Facebook,
    Instagram,
    Linkedin,
    RouterLinkWithHref,
    RouterOutlet,
    SignIn,
    SignOut,
    Toast,
    Twitter,
    Youtube,
  ],
  templateUrl: './app.html',
  styles: ':host { display: contents; }',
})
export class App {
  readonly #authService = inject(AuthService);
  readonly #gateFrontendServiceUrl = inject(GATE_FRONTEND_SERVICE_URL_TOKEN);

  readonly isAuthed = toSignal(this.#authService.isAuthenticated$);

  getAuthHref(login: boolean) {
    const url = new URL(`${this.#gateFrontendServiceUrl}`);
    url.searchParams.append('action', login ? 'login' : 'logout');
    url.searchParams.append('redirect_to', window.location.href);

    return url.href;
  }

  logout() {
    this.#authService.resetAccessToken();
  }
}
