import { Component, inject, OnInit } from '@angular/core';
import { Spinner } from '@primeicons/angular/spinner';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { MANAGEMENT_ROLES } from '../../../shared/constants/staff-roles.constant';

@Component({
  templateUrl: './root-redirect.html',
  imports: [Spinner],
})
export class RootRedirect implements OnInit {
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  ngOnInit(): void {
    const canSeeManagementTabs = this.#authService.hasRoles(MANAGEMENT_ROLES);

    this.#router.navigate([canSeeManagementTabs ? '/request/list' : '/clearance'], {
      replaceUrl: true,
    });
  }
}
