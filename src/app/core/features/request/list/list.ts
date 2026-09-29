import { Component, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { AuthService } from '../../../../shared/services/auth.service';
import {
  IRequestListFilters,
  RequestListTable,
} from '../../../components/request-list/request-list';
import { ShellService } from '../../../services/shell.service';

@Component({
  templateUrl: './list.html',
  styles: ':host { display: contents; }',
  imports: [FormsModule, TableModule, RequestListTable],
})
export class RequestList implements OnInit {
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);
  readonly #shellService = inject(ShellService);

  readonly toolbarTpl = viewChild<TemplateRef<void>>('toolbarTpl');

  readonly isAdmin = toSignal(this.#authService.isAdmin$);

  readonly filters = signal<IRequestListFilters>({
    departmentId: null,
    skip: 0,
    staffId: null,
  });

  readonly filtersForm = form(this.filters);

  constructor() {
    this.#activatedRoute.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe(({ archived, completed, departmentId, incompleted, skip, staffId }) => {
        this.filters.set({
          archived: archived ? archived === 'true' : undefined,
          departmentId: departmentId ? +departmentId : null,
          completed: completed ? completed === 'true' : undefined,
          incompleted: incompleted ? incompleted === 'true' : undefined,
          skip: skip ? +skip : 0,
          staffId: staffId ? +staffId : null,
        });
      });
  }

  ngOnInit(): void {
    this.#shellService.setToolbarTpl(this.toolbarTpl());
  }

  onSearch(prop: 'departmentId' | 'staffId', val: number | null) {
    this.#navigate({ [prop]: val || undefined, skip: undefined });
  }

  onFiltersChange({ skip }: IRequestListFilters) {
    this.#navigate({ skip: skip || undefined });
  }

  #navigate(queryParams: Params) {
    this.#router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}
