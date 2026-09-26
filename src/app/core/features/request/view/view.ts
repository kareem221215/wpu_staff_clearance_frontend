import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Building } from '@primeicons/angular/building';
import { CheckCircle } from '@primeicons/angular/check-circle';
import { ExclamationTriangle } from '@primeicons/angular/exclamation-triangle';
import { Folder } from '@primeicons/angular/folder';
import { GraduationCap } from '@primeicons/angular/graduation-cap';
import { Print } from '@primeicons/angular/print';
import { Spinner } from '@primeicons/angular/spinner';
import { Tags } from '@primeicons/angular/tags';
import { TimesCircle } from '@primeicons/angular/times-circle';
import { ButtonDirective } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Message } from 'primeng/message';
import { finalize, forkJoin, switchMap, tap } from 'rxjs';
import { DialogContainer } from '../../../../shared/components/dialog-container/dialog-container';
import { AuthService } from '../../../../shared/services/auth.service';
import { ApprovalList } from '../../../components/approval-list/approval-list';
import { RequestsHttpService } from '../../../http-services/requests.http-service';
import { StaffHttpService } from '../../../http-services/staff.http-service';
import { IRequestApproval } from '../../../interfaces/request-approval.interface';
import { IRequest } from '../../../interfaces/request.interface';
import { IStaff } from '../../../interfaces/staff.interface';
import { RequestsService } from '../../../services/requests.service';

@Component({
  templateUrl: './view.html',
  imports: [
    ApprovalList,
    Building,
    ButtonDirective,
    CheckCircle,
    DialogContainer,
    ExclamationTriangle,
    Folder,
    GraduationCap,
    Message,
    Print,
    RouterLink,
    Spinner,
    Tags,
    TimesCircle,
  ],
  styles: ':host { display: contents; }',
})
export class RequestView implements OnInit {
  readonly #authService = inject(AuthService);
  readonly #ref = inject(DynamicDialogRef);
  readonly #requestsHttpService = inject(RequestsHttpService);
  readonly #requestsService = inject(RequestsService);
  readonly #staffHttpService = inject(StaffHttpService);

  readonly requestId = input.required<number>();

  readonly loading = signal(true);
  readonly request = signal<IRequest | null>(null);
  readonly staff = signal<IStaff | null>(null);
  readonly approvals = signal<IRequestApproval[]>([]);

  readonly displayApprovals = computed(() =>
    [...this.approvals()].sort((a, b) => a.order - b.order),
  );

  ngOnInit(): void {
    this.#requestsHttpService
      .fetchById$(this.requestId())
      .pipe(
        tap((request) => {
          this.request.set(request);
        }),
        switchMap((request) =>
          forkJoin({
            staff: this.#staffHttpService.fetchById$(request.staffId),
            approvals: this.#requestsHttpService.fetchApprovals$(request.requestId),
          }),
        ),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe(({ staff, approvals }) => {
        this.staff.set(staff);
        this.approvals.set(approvals);
      });
  }

  close() {
    this.#ref.close();
  }

  approve(evt: MouseEvent) {
    const request = this.request()!;

    this.#requestsService.approve(evt, request).then(() => {
      this.#ref.close(true);
    });
  }

  reject() {
    const request = this.request()!;

    this.#requestsService.reject(request).then((rejected) => {
      this.#ref.close(rejected);
    });
  }

  archive(evt: MouseEvent) {
    this.#requestsService.archive(evt, this.request()!).then(() => {
      this.#ref.close(true);
    });
  }

  isPermittedToTakeAction({ nextApproverStaffId }: IRequest) {
    return nextApproverStaffId !== null && nextApproverStaffId === this.#authService.staffId;
  }

  canApprove(request: IRequest) {
    return this.#requestsService.canApprove(request);
  }

  canReject(request: IRequest) {
    return this.#requestsService.canReject(request);
  }

  canArchive(request: IRequest) {
    return this.#requestsService.canArchive(request);
  }

  canPrint(request: IRequest) {
    return this.#requestsService.canPrint(request);
  }

  isCompleted(request: IRequest) {
    return this.#requestsService.isCompleted(request);
  }
}
