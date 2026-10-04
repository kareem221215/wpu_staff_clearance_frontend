import { NgClass } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Building } from '@primeicons/angular/building';
import { Calendar } from '@primeicons/angular/calendar';
import { CaretLeft } from '@primeicons/angular/caret-left';
import { CheckCircle } from '@primeicons/angular/check-circle';
import { ExclamationTriangle } from '@primeicons/angular/exclamation-triangle';
import { Folder } from '@primeicons/angular/folder';
import { GraduationCap } from '@primeicons/angular/graduation-cap';
import { NoteSticky } from '@primeicons/angular/note-sticky';
import { Print } from '@primeicons/angular/print';
import { Spinner } from '@primeicons/angular/spinner';
import { TimesCircle } from '@primeicons/angular/times-circle';
import { User } from '@primeicons/angular/user';
import { ButtonDirective } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Message } from 'primeng/message';
import { DialogContainer } from '../../../../shared/components/dialog-container/dialog-container';
import { AuthService } from '../../../../shared/services/auth.service';
import { RequestApprovalStatusEnum } from '../../../enums/request-approval-status.enum';
import { IRequest } from '../../../interfaces/request.interface';
import { RequestsService } from '../../../services/requests.service';
import { deriveApprovals } from '../../../utils/pipeline.utils';

@Component({
  templateUrl: './view.html',
  imports: [
    Building,
    ButtonDirective,
    Calendar,
    CaretLeft,
    CheckCircle,
    DialogContainer,
    ExclamationTriangle,
    Folder,
    GraduationCap,
    Message,
    NgClass,
    NoteSticky,
    Print,
    Spinner,
    TimesCircle,
    User,
  ],
  styles: ':host { display: contents; }',
})
export class RequestView {
  readonly #authService = inject(AuthService);
  readonly #ref = inject(DynamicDialogRef);
  readonly #requestsService = inject(RequestsService);
  readonly #router = inject(Router);

  readonly request = input.required<IRequest>();

  protected readonly RequestApprovalStatusEnum = RequestApprovalStatusEnum;

  readonly approvals = computed(() =>
    deriveApprovals(this.request()).filter(
      (approval) => approval.status !== RequestApprovalStatusEnum.PENDING,
    ),
  );

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
