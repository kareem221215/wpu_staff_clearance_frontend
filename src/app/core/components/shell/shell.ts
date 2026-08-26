import { NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLinkActive, RouterLinkWithHref, RouterOutlet } from '@angular/router';
import { GraduationCap } from '@primeicons/angular/graduation-cap';
import { List } from '@primeicons/angular/list';
import { Users } from '@primeicons/angular/users';
import { ButtonDirective } from 'primeng/button';
import { ShellService } from '../../services/shell.service';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.html',
  imports: [
    ButtonDirective,
    FormsModule,
    GraduationCap,
    List,
    RouterLinkActive,
    RouterLinkWithHref,
    RouterOutlet,
    Users,
    NgTemplateOutlet,
  ],
})
export class Shell {
  readonly #shellService = inject(ShellService);

  readonly toolbarTpl = toSignal(this.#shellService.toolbarTpl$);
}
