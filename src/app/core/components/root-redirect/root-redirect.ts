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
    const payload = this.#authService.accessTokenPayload;
    const isDepartmentStaff =
      this.#authService.isStaff && !(this.#authService.accessTokenPayload?.roles?.length);

    if (isDepartmentStaff) {
      this.#router.navigate(['/clearance'], {
        queryParams: { staffId: payload!.sub },
        replaceUrl: true,
      });
    } else {
      this.#router.navigate(['/request/list'], { replaceUrl: true });
    }
  }
}
