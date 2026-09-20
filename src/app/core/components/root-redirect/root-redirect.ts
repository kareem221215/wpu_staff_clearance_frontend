import { Component, inject, OnInit } from '@angular/core';
import { Spinner } from '@primeicons/angular/spinner';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { UserTypeEnum } from '../../../shared/enums/user-type.enum';
@Component({
  templateUrl: './root-redirect.html',
  imports: [Spinner],
})
export class RootRedirect implements OnInit {
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  ngOnInit(): void {
    const isStaff = this.#authService.accessTokenPayload?.type.includes(UserTypeEnum.STAFF);

    this.#router.navigate([isStaff ? '/students' : 'request/list'], { replaceUrl: true });
  }
}
