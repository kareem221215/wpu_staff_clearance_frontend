import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { form } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { Bolt } from '@primeicons/angular/bolt';
import { Building } from '@primeicons/angular/building';
import { Calendar } from '@primeicons/angular/calendar';
import { Eye } from '@primeicons/angular/eye';
import { Hashtag } from '@primeicons/angular/hashtag';
import { Plus } from '@primeicons/angular/plus';
import { ButtonDirective } from 'primeng/button';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { UserRoleEnum } from '../../../../shared/enums/user-role.enum';
import { IHttpListResponse } from '../../../../shared/interfaces/http-list-response.interface';
import { AuthService } from '../../../../shared/services/auth.service';
import { CollegesHttpService } from '../../../http-services/colleges.http-service';
import { DecisionsHttpService } from '../../../http-services/decisions.http-service';
import { IDecision } from '../../../interfaces/decision.interface';
import { IRequest } from '../../../interfaces/request.interface';
import { DecisionsService } from '../../../services/decisions.service';
import { ShellService } from '../../../services/shell.service';

@Component({
  templateUrl: './list.html',
  styles: ':host { display: contents; }',
  imports: [Bolt, Building, ButtonDirective, Calendar, Eye, Hashtag, TableModule],
})
export class DecisionList implements OnInit {
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #authService = inject(AuthService);
  readonly #collegesHttpService = inject(CollegesHttpService);
  readonly #decisionsHttpService = inject(DecisionsHttpService);
  readonly #decisionsService = inject(DecisionsService);
  readonly #router = inject(Router);
  readonly #shellService = inject(ShellService);

  readonly toolbarTpl = viewChild<TemplateRef<void>>('toolbarTpl');

  readonly pageSize = 10;

  readonly decisions = signal<IHttpListResponse<IDecision>>({ data: [], total: 0 });
  readonly requests = signal<IHttpListResponse<IRequest>>({ data: [], total: 0 });
  readonly loading = signal(true);
  readonly requestsLoading = signal(true);
  readonly searchModel = signal<{ collegeId: number | null; skip: number }>({
    collegeId: null,
    skip: 0,
  });

  readonly searchForm = form(this.searchModel);

  readonly collegeMap = computed(
    () => new Map(this.colleges().map(({ collegeId, name }) => [collegeId, name])),
  );

  readonly colleges = toSignal(this.#collegesHttpService.fetch$(), { initialValue: [] });

  constructor() {
    this.#activatedRoute.queryParams.pipe(takeUntilDestroyed()).subscribe(({ collegeId, skip }) => {
      this.searchModel.set({
        collegeId: collegeId ? +collegeId : null,
        skip: skip ? +skip : 0,
      });

      this.fetch();
    });
  }

  ngOnInit(): void {
    this.#shellService.setToolbarTpl(this.toolbarTpl());
  }

  onLazyLoad({ first = 0 }: TableLazyLoadEvent) {
    this.#router.navigate([], {
      queryParams: { skip: first || undefined },
      queryParamsHandling: 'merge',
    });
  }

  fetch() {
    this.loading.set(true);

    const { collegeId, skip } = this.searchModel();

    this.#decisionsHttpService
      .fetch$({
        ...this.searchModel(),
        collegeIds: collegeId ? [collegeId] : undefined,
        skip,
        take: this.pageSize,
      })
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe((decisions) => {
        this.decisions.set(decisions);
      });
  }

  onCollegeSelect(val: number | null) {
    this.#router.navigate([], {
      queryParams: { collegeId: val || undefined, skip: undefined },
      queryParamsHandling: 'merge',
    });
  }

  openViewDialog(decisionId: number) {
    this.#decisionsService.openViewDialog(decisionId);
  }

  // isAffairsManager() {
  //   return this.#authService.hasRoles([UserRoleEnum.CENTRAL_AFFAIRS_MANAGER]);
  // }
}
