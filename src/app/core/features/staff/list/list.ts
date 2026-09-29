import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';
import { Send } from '@primeicons/angular/send';
import { ButtonDirective } from 'primeng/button';
import { finalize, of, switchMap, tap } from 'rxjs';
import { IHttpListResponse } from '../../../../shared/interfaces/http-list-response.interface';
import { AuthService } from '../../../../shared/services/auth.service';
import { ApprovalList } from '../../../components/approval-list/approval-list';
import { RequestApprovalStatusEnum } from '../../../enums/request-approval-status.enum';
import { RequestsHttpService } from '../../../http-services/requests.http-service';
import { StaffHttpService } from '../../../http-services/staff.http-service';
import { IRequestApproval } from '../../../interfaces/request-approval.interface';
import { IStaff } from '../../../interfaces/staff.interface';
import { RequestsService } from '../../../services/requests.service';
import { ShellService } from '../../../services/shell.service';

@Component({
  imports: [ApprovalList, ButtonDirective, FormsModule, Send],
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

  readonly toolbarTpl = viewChild<TemplateRef<void>>('toolbarTpl');

  readonly approvals = signal<IRequestApproval[]>([]);
  readonly creating = signal(false);
  readonly loading = signal(true);
  readonly staff = signal<IHttpListResponse<IStaff>>({ data: [], total: 0 });

  readonly isAdmin = toSignal(this.#authService.isAdmin$);

  readonly myDepartmentId = signal<number | null | undefined>(undefined);

  readonly staffId = signal<number | null>(null);

  readonly searchModel = signal<{ departmentId: number | null; searchTxt: string }>({
    departmentId: null,
    searchTxt: '',
  });

  readonly searchForm = form(this.searchModel);

  readonly displayApprovals = computed<IRequestApproval[]>(() => {
    const approvals = this.approvals();

    if (approvals.length > 0) {
      return [...approvals].sort((a, b) => a.order - b.order);
    }

    return this.staff().data.map((manager, index) => ({
      requestApprovalId: -(index + 1),
      requestId: 0,
      order: index + 1,
      staffId: manager.staffId,
      staffName: manager.name,
      departmentName: manager.departmentName,
      status: RequestApprovalStatusEnum.PENDING,
      note: null,
      decidedAt: null,
    }));
  });

  constructor() {
    this.#activatedRoute.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe(({ departmentId, searchTxt, staffId }) => {
        this.searchModel.set({
          departmentId: departmentId ? +departmentId : null,
          searchTxt: searchTxt || '',
        });

        this.staffId.set(staffId ? +staffId : this.#authService.staffId!);

        if (this.myDepartmentId() !== undefined) {
          this.fetch();
        }
      });
  }

  ngOnInit(): void {
    this.#shellService.setToolbarTpl(this.toolbarTpl());
    this.#fetchApprovals();

    this.#staffHttpService.fetchById$(this.staffId()!).subscribe((staff) => {
      this.myDepartmentId.set(staff?.departmentId ?? null);
      this.fetch();
    });
  }

  fetch() {
    this.loading.set(true);

    const { departmentId, searchTxt } = this.searchModel();
    const effectivedepartmentId = departmentId ?? this.myDepartmentId() ?? null;

    this.#staffHttpService
      .fetchManagers$({
        departmentIds: effectivedepartmentId ? [effectivedepartmentId] : undefined,
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
