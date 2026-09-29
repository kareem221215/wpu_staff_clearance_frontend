import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
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
import { finalize } from 'rxjs';
import { DialogContainer } from '../../../../shared/components/dialog-container/dialog-container';
import { AuthService } from '../../../../shared/services/auth.service';
import { ApprovalList } from '../../../components/approval-list/approval-list';
import { StaffHttpService } from '../../../http-services/staff.http-service';
import { IRequest } from '../../../interfaces/request.interface';
import { IStaff } from '../../../interfaces/staff.interface';
import { RequestsService } from '../../../services/requests.service';
import { deriveApprovals } from '../../../utils/pipeline.utils';

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
    Spinner,
    Tags,
    TimesCircle,
  ],
  styles: ':host { display: contents; }',
})
export class RequestView implements OnInit {
  readonly #authService = inject(AuthService);
  readonly #ref = inject(DynamicDialogRef);
  readonly #requestsService = inject(RequestsService);
  readonly #router = inject(Router);
  readonly #staffHttpService = inject(StaffHttpService);

  readonly request = input.required<IRequest>();

  readonly loading = signal(true);
  readonly staff = signal<IStaff | null>(null);

  readonly displayApprovals = computed(() => deriveApprovals(this.request()));

  ngOnInit(): void {
    this.#staffHttpService
      .fetchById$(this.request().employeeId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((staff) => this.staff.set(staff));
  }

  close() {
    this.#ref.close();
  }

  approve(evt: MouseEvent) {
    this.#requestsService.approve(evt, this.request()).then(() => {
      this.#ref.close(true);
    });
  }

  reject() {
    this.#requestsService.reject(this.request()).then((rejected) => {
      this.#ref.close(rejected);
    });
  }

  archive(evt: MouseEvent) {
    this.#requestsService.archive(evt, this.request()).then(() => {
      this.#ref.close(true);
    });
  }

  navigateToPrint() {
    this.#ref.close(false);
    this.#router.navigate(['/request/print', this.request().requestId], {
      state: { request: this.request() },
    });
  }

  isPermittedToTakeAction(request: IRequest) {
    return request.nextActionRole !== null && this.#authService.hasRoles([request.nextActionRole]);
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
