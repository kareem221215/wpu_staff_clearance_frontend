import { NgClass } from '@angular/common';
import { Component, inject, resource, signal, TemplateRef, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { form } from '@angular/forms/signals';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Bolt } from '@primeicons/angular/bolt';
import { Building } from '@primeicons/angular/building';
import { CheckCircle } from '@primeicons/angular/check-circle';
import { Eye } from '@primeicons/angular/eye';
import { GraduationCap } from '@primeicons/angular/graduation-cap';
import { Hashtag } from '@primeicons/angular/hashtag';
import { ButtonDirective } from 'primeng/button';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../../../shared/services/auth.service';
import { ApproveButton } from '../../../components/buttons/approve-button/approve-button';
import { ArchiveButton } from '../../../components/buttons/archive-button/archive-button';
import { PrintButton } from '../../../components/buttons/print-button/print-button';
import { RejectButton } from '../../../components/buttons/reject-button/reject-button';
import { RequestActionTypeEnum } from '../../../enums/request-action-type.enum';
import { RequestsHttpService } from '../../../http-services/requests.http-service';
import { IRequest } from '../../../interfaces/request.interface';
import { RequestPolicyService } from '../../../services/request-policy.service';
import { RequestsService } from '../../../services/requests.service';
import { ShellService } from '../../../services/shell.service';

export interface IRequestListFilters {
  readonly archived?: boolean;
  readonly completed?: boolean;
  readonly departmentId: number | null;
  readonly employeeId: number | null;
  readonly skip: number;
}

@Component({
  imports: [
    ApproveButton,
    ArchiveButton,
    Bolt,
    Building,
    ButtonDirective,
    CheckCircle,
    Eye,
    GraduationCap,
    Hashtag,
    NgClass,
    PrintButton,
    RejectButton,
    Table,
  ],
  styles: ':host { display: contents; }',
  templateUrl: './list.html',
  selector: 'app-request-list',
})
export class RequestList {
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #authService = inject(AuthService);
  readonly #requestPolicyService = inject(RequestPolicyService);
  readonly #requestsHttpService = inject(RequestsHttpService);
  readonly #requestsService = inject(RequestsService);
  readonly #router = inject(Router);
  readonly #shellService = inject(ShellService);

  protected readonly pageSize = 10;

  readonly toolbarTpl = viewChild<TemplateRef<void>>('toolbarTpl');

  readonly filters = signal<IRequestListFilters>({
    departmentId: null,
    skip: 0,
    employeeId: null,
  });

  protected readonly requestListResource = resource({
    defaultValue: {
      data: [],
      total: 0,
    },
    loader: ({ params }) => {
      const { employeeId: employeeId, ...filters } = params;

      return lastValueFrom(
        this.#requestsHttpService.fetch$({
          ...filters,
          employeeIds: employeeId ? [employeeId] : undefined,
          take: this.pageSize,
        }),
      );
    },
    params: () => this.filters(),
  });

  readonly filtersForm = form(this.filters);

  readonly isAdmin = toSignal(this.#authService.isAdmin$);

  constructor() {
    this.#activatedRoute.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe(({ archived, completed, departmentId, skip, employeeId }) => {
        this.filters.set({
          archived: archived ? archived === 'true' : undefined,
          departmentId: +departmentId || null,
          completed: completed ? completed === 'true' : undefined,
          skip: +skip || 0,
          employeeId: +employeeId || null,
        });
      });
  }

  ngOnInit(): void {
    this.#shellService.setToolbarTpl(this.toolbarTpl());
  }

  protected onLazyLoad({ first = 0 }: TableLazyLoadEvent) {
    this.#navigate({ skip: first || undefined });
  }

  protected openViewDialog(request: IRequest) {
    this.#requestsService.openViewDialog(request).then((payload: boolean) => {
      if (payload) {
        this.requestListResource.reload();
      }
    });
  }

  protected onAction(actionTaken: boolean) {
    if (actionTaken) {
      this.requestListResource.reload();
    }
  }

  protected countApprovals(request: IRequest) {
    return request.actions.filter(({ type }) => type === RequestActionTypeEnum.APPROVE).length;
  }

  protected canTakeAction(request: IRequest) {
    return this.#requestPolicyService.canTakeAction(request);
  }

  protected canApproveOrReject(request: IRequest) {
    return (
      this.#requestPolicyService.canApprove(request) ||
      this.#requestPolicyService.canReject(request)
    );
  }

  #navigate(queryParams: Params) {
    this.#router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}
