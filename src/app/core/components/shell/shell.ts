import { NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLinkActive, RouterLinkWithHref, RouterOutlet } from '@angular/router';
import { GraduationCap } from '@primeicons/angular/graduation-cap';
import { List } from '@primeicons/angular/list';
import { Users } from '@primeicons/angular/users';
import { ButtonDirective } from 'primeng/button';
import { UserRoleEnum } from '../../../shared/enums/user-role.enum';
import { MANAGEMENT_ROLES } from '../../../shared/constants/staff-roles.constant';
import { AuthService } from '../../../shared/services/auth.service';
import { ShellService } from '../../services/shell.service';

@Component({
  templateUrl: './shell.html',
  imports: [
    ButtonDirective,
    FormsModule,
    GraduationCap,
    List,
    NgTemplateOutlet,
    RouterLinkActive,
    RouterLinkWithHref,
    RouterOutlet,
    Users,
  ],
})
export class Shell {
  readonly #shellService = inject(ShellService);
  readonly #authService = inject(AuthService);

  readonly toolbarTpl = toSignal(this.#shellService.toolbarTpl$);

  canSeeDecisions() {
    return this.#authService.hasRoles([UserRoleEnum.ADMIN]);
  }

  canSeeManagementTabs() {
    return this.#authService.hasRoles(MANAGEMENT_ROLES);
  }
}
