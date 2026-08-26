import { Component, inject, OnInit } from '@angular/core';
import { Spinner } from '@primeicons/angular/spinner';
import { AuthService } from '../../../shared/services/auth.service';
import { UserRoleEnum } from '../../../shared/enums/user-role.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root-redirect',
  templateUrl: './root-redirect.html',
  imports: [Spinner],
})
export class RootRedirect implements OnInit {
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  ngOnInit(): void {
    const isHR = this.#authService.accessTokenPayload?.roles.includes(
      UserRoleEnum.HUMAN_RESOURCES,
    );

    this.#router.navigate([isHR ? '/requests' : '/clearance'], { replaceUrl: true });
  }
}
