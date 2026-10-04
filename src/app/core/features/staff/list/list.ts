import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Send } from '@primeicons/angular/send';
import { ButtonDirective } from 'primeng/button';
import { finalize, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../../../shared/services/auth.service';
import { ApprovalList } from '../../../components/approval-list/approval-list';
import { RequestApprovalStatusEnum } from '../../../enums/request-approval-status.enum';
import { RequestsHttpService } from '../../../http-services/requests.http-service';
import { IRequest } from '../../../interfaces/request.interface';
import { IRequestApproval } from '../../../interfaces/request-approval.interface';
import { RequestsService } from '../../../services/requests.service';
import { ShellService } from '../../../services/shell.service';
import { deriveApprovals } from '../../../utils/pipeline.utils';

@Component({
  imports: [ApprovalList, ButtonDirective, Send],
  styles: ':host { display: contents; }',
  templateUrl: './list.html',
})
export class StaffList implements OnInit {
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #authService = inject(AuthService);
  readonly #requestsHttpService = inject(RequestsHttpService);
  readonly #requestsService = inject(RequestsService);
  readonly #shellService = inject(ShellService);

  readonly toolbarTpl = viewChild<TemplateRef<void>>('toolbarTpl');

  readonly approvals = signal<IRequestApproval[]>([]);
  readonly creating = signal(false);
  readonly loading = signal(true);

  readonly staffId = signal<number | null>(null);
  readonly currentRequest = signal<IRequest | null>(null);

  readonly displayApprovals = computed(() =>
    [...this.approvals()].sort((a, b) => a.order - b.order),
  );

  constructor() {
    this.#activatedRoute.queryParams.pipe(takeUntilDestroyed()).subscribe(({ staffId }) => {
      this.staffId.set(staffId ? +staffId : this.#authService.staffId!);
      this.#fetchMyRequest();
    });
  }

  ngOnInit(): void {
    this.#shellService.setToolbarTpl(this.toolbarTpl());
  }

  startProcess() {
    this.creating.set(true);

    this.#requestsHttpService
      .create$()
      .pipe(finalize(() => this.creating.set(false)))
      .subscribe(() => {
        this.#fetchMyRequest();
      });
  }

  canCreate() {
    const request = this.currentRequest();

    return this.#requestsService.canCreate() && (!request || this.#requestsService.isCompleted(request));
  }

  #fetchMyRequest() {
    // TEMPORARY: GET /requests?employeeIds=... 403s for regular staff (the
    // backend's @Role guard only allows managers through — see the "staff
    // can't see their own clearance status" conversation). Until that's
    // fixed on the backend, hardcode requestId 1 instead of the real
    // employeeId-based lookup below. Swap this back once it's resolved.
    this.loading.set(true);

    this.#requestsHttpService
      .fetchById$(1)
      .pipe(
        tap(({ data: request }) => this.currentRequest.set(request ?? null)),
        switchMap(({ data: request }) => {
          if (!request) return of([]);

          return of(
            deriveApprovals(request).filter(
              (approval) => approval.status !== RequestApprovalStatusEnum.PENDING,
            ),
          );
        }),
        tap((approvals) => this.approvals.set(approvals)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();

    // const employeeId = this.staffId();
    //
    // if (!employeeId) return;
    //
    // this.loading.set(true);
    //
    // this.#requestsHttpService
    //   .fetch$({ employeeIds: [employeeId], take: 1 })
    //   .pipe(
    //     tap(({ data }) => this.currentRequest.set(data[0] ?? null)),
    //     switchMap(({ data }) => {
    //       const request = data[0];
    //
    //       if (!request) return of([]);
    //
    //       return of(
    //         deriveApprovals(request).filter(
    //           (approval) => approval.status !== RequestApprovalStatusEnum.PENDING,
    //         ),
    //       );
    //     }),
    //     tap((approvals) => this.approvals.set(approvals)),
    //     finalize(() => this.loading.set(false)),
    //   )
    //   .subscribe();
  }
}
