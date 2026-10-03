import { Component, inject, OnInit } from '@angular/core';
import { Spinner } from '@primeicons/angular/spinner';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
@Component({
  templateUrl: './root-redirect.html',
  imports: [Spinner],
})
export class RootRedirect implements OnInit {
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  ngOnInit(): void {
    if (!this.#authService.canSeeAllTabs) {
      this.#router.navigate(['/clearance'], {
        queryParams: { staffId: this.#authService.staffId },
        replaceUrl: true,
      });
    } else {
      this.#router.navigate(['/request/list'], { replaceUrl: true });
    }
  }
}
