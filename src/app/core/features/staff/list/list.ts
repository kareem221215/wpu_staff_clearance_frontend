import { Component, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { Bolt } from '@primeicons/angular/bolt';
import { Building } from '@primeicons/angular/building';
import { Check } from '@primeicons/angular/check';
import { Send } from '@primeicons/angular/send';
import { Spinner } from '@primeicons/angular/spinner';
import { Times } from '@primeicons/angular/times';
import { User } from '@primeicons/angular/user';
import { ButtonDirective } from 'primeng/button';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { finalize, of, switchMap, tap } from 'rxjs';
import { IHttpListResponse } from '../../../../shared/interfaces/http-list-response.interface';
import { AuthService } from '../../../../shared/services/auth.service';
import { RequestsHttpService } from '../../../http-services/requests.http-service';
import { StaffHttpService } from '../../../http-services/staff.http-service';
import { IRequestApproval } from '../../../interfaces/request-approval.interface';
import { IStaff } from '../../../interfaces/staff.interface';
import { RequestsService } from '../../../services/requests.service';
import { ShellService } from '../../../services/shell.service';

@Component({
  imports: [
    Bolt,
    Building,
    ButtonDirective,
    Check,
    Send,
    Spinner,
    TableModule,
    Times,
    User,
    FormsModule,
  ],
  styles: ':host { display: contents; }',
  templateUrl: './list.html',
})
export class StaffList implements OnInit {
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #authService = inject(AuthService);
  readonly #requestsHttpService = inject(RequestsHttpService);
  readonly #requestsService = inject(RequestsService);
  readonly #router = inject(Router);
  readonly #shellService = inject(ShellService);
  readonly #staffHttpService = inject(StaffHttpService);

  readonly toolbarTpl = viewChild<TemplateRef<void>>('toolbarTpl');

  readonly pageSize = 10;

  readonly approvals = signal<IRequestApproval[]>([]);
  readonly creating = signal(false);
  readonly loading = signal(true);
  readonly staff = signal<IHttpListResponse<IStaff>>({ data: [], total: 0 });

  readonly isAdmin = toSignal(this.#authService.isAdmin$);

  readonly searchModel = signal<{ collegeId: number | null; searchTxt: string; skip: number }>({
    collegeId: null,
    searchTxt: '',
    skip: 0,
  });

  readonly searchForm = form(this.searchModel);

  constructor() {
    this.#activatedRoute.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe(({ collegeId, searchTxt, skip }) => {
        this.searchModel.set({
          collegeId: collegeId ? +collegeId : null,
          searchTxt: searchTxt || '',
          skip: skip ? +skip : 0,
        });

        this.fetch();
      });
  }

  ngOnInit(): void {
    this.#shellService.setToolbarTpl(this.toolbarTpl());
    this.#fetchApprovals();
  }

  onLazyLoad({ first = 0 }: TableLazyLoadEvent) {
    this.#router.navigate([], {
      queryParams: { skip: first || undefined },
      queryParamsHandling: 'merge',
    });
  }

  fetch() {
    this.loading.set(true);

    const { collegeId, searchTxt, skip } = this.searchModel();

    this.#staffHttpService
      .fetchManagers$({
        collegeIds: collegeId ? [collegeId] : undefined,
        searchTxt: searchTxt || undefined,
        skip,
        take: this.pageSize,
      })
      .pipe(
        tap((res) => {
          this.staff.set(res);
        }),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe();
  }

  startProcess() {
    this.creating.set(true);

    this.#requestsHttpService
      .create$(this.#authService.accessTokenPayload!.sub)
      .pipe(finalize(() => this.creating.set(false)))
      .subscribe(() => {
        this.fetch();
        this.#fetchApprovals();
      });
  }

  getApproval(manager: IStaff): IRequestApproval | undefined {
    return this.approvals().find((a) => a.staffId === manager.staffId);
  }

  canCreate() {
    return this.#requestsService.canCreate();
  }

  #fetchApprovals() {
    this.#requestsHttpService
      .fetchBytaffId$(this.#authService.accessTokenPayload!.sub)
      .pipe(
        switchMap((request) => {
          if (!request) return of([]);
          return this.#requestsHttpService.fetchApprovals$(request.requestId);
        }),
        tap((approvals) => this.approvals.set(approvals)),
      )
      .subscribe();
  }
}
