import { Component, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';
import { Bolt } from '@primeicons/angular/bolt';
import { Building } from '@primeicons/angular/building';
import { InfoCircle } from '@primeicons/angular/info-circle';
import { Send } from '@primeicons/angular/send';
import { Spinner } from '@primeicons/angular/spinner';
import { User } from '@primeicons/angular/user';
import { ButtonDirective } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { TableModule } from 'primeng/table';
import { finalize, of, switchMap, tap } from 'rxjs';
import { IHttpListResponse } from '../../../../shared/interfaces/http-list-response.interface';
import { AuthService } from '../../../../shared/services/auth.service';
import { RequestApprovalStatusEnum } from '../../../enums/request-approval-status.enum';
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
    InfoCircle,
    Popover,
    Send,
    Spinner,
    TableModule,
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
  readonly #shellService = inject(ShellService);
  readonly #staffHttpService = inject(StaffHttpService);

  protected readonly RequestApprovalStatusEnum = RequestApprovalStatusEnum;

  readonly toolbarTpl = viewChild<TemplateRef<void>>('toolbarTpl');

  readonly approvals = signal<IRequestApproval[]>([]);
  readonly creating = signal(false);
  readonly loading = signal(true);
  readonly staff = signal<IHttpListResponse<IStaff>>({ data: [], total: 0 });

  readonly isAdmin = toSignal(this.#authService.isAdmin$);

  // undefined = not resolved yet, null = unknown, number = the logged-in
  // staff's own department — used to scope the direct manager shown below.
  readonly myCollegeId = signal<number | null | undefined>(undefined);

  // Whose clearance page this is. Comes from the `staffId` query param so the
  // URL is shareable/bookmarkable (e.g. a manager could open someone else's
  // page); falls back to the logged-in user's own id when absent. A real
  // backend is the one that decides whether the caller may actually see it.
  readonly staffId = signal<number | null>(null);

  readonly searchModel = signal<{ collegeId: number | null; searchTxt: string }>({
    collegeId: null,
    searchTxt: '',
  });

  readonly searchForm = form(this.searchModel);

  constructor() {
    this.#activatedRoute.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe(({ collegeId, searchTxt, staffId }) => {
        this.searchModel.set({
          collegeId: collegeId ? +collegeId : null,
          searchTxt: searchTxt || '',
        });

        this.staffId.set(staffId ? +staffId : this.#authService.staffId!);

        if (this.myCollegeId() !== undefined) {
          this.fetch();
        }
      });
  }

  ngOnInit(): void {
    this.#shellService.setToolbarTpl(this.toolbarTpl());
    this.#fetchApprovals();

    this.#staffHttpService.fetchById$(this.staffId()!).subscribe((staff) => {
      this.myCollegeId.set(staff?.collegeId ?? null);
      this.fetch();
    });
  }

  fetch() {
    this.loading.set(true);

    const { collegeId, searchTxt } = this.searchModel();
    const effectiveCollegeId = collegeId ?? this.myCollegeId() ?? null;

    this.#staffHttpService
      .fetchManagers$({
        collegeIds: effectiveCollegeId ? [effectiveCollegeId] : undefined,
        searchTxt: searchTxt || undefined,
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
      .create$(this.staffId()!)
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
      .fetchBytaffId$(this.staffId()!)
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
