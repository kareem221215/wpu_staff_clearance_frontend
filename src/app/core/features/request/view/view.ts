import { NgClass } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
import { Tags } from '@primeicons/angular/tags';
import { TimesCircle } from '@primeicons/angular/times-circle';
import { ButtonDirective } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Message } from 'primeng/message';
import { finalize, switchMap, tap } from 'rxjs';
import { DialogContainer } from '../../../../shared/components/dialog-container/dialog-container';
import { AuthService } from '../../../../shared/services/auth.service';
import { RequestActionTypeEnum } from '../../../enums/request-action-type.enum';
import { RequestsHttpService } from '../../../http-services/requests.http-service';
import { StaffHttpService } from '../../../http-services/staff.http-service';
import { IRequestAction } from '../../../interfaces/request-action.interface';
import { IRequest } from '../../../interfaces/request.interface';
import { IStaff } from '../../../interfaces/staff.interface';
import { RequestsService } from '../../../services/requests.service';

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

  readonly actions = computed(() => {
    const request = this.request();

    if (request === null) {
      return [];
    }

    return request.actions.filter(
      ({ type, role }) =>
        type !== RequestActionTypeEnum.REJECT ||
        !request.actions.some(
          (action) => action.type === RequestActionTypeEnum.APPROVE && action.role === role,
        ),
    );
  });

  ngOnInit(): void {
    this.#requestsHttpService
      .fetchById$(this.requestId())
      .pipe(
        tap((request) => {
          this.request.set(request);
        }),
        switchMap((request) => this.#staffHttpService.fetchById$(request.staffId)),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe((staff) => {
        this.staff.set(staff);
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

  isPermittedToTakeAction({ nextActionRole }: IRequest) {
    return nextActionRole && this.#authService.hasRoles([nextActionRole]);
  }

  isApproval({ type }: IRequestAction) {
    return type === RequestActionTypeEnum.APPROVE;
  }

  isRejection({ type }: IRequestAction) {
    return type === RequestActionTypeEnum.REJECT;
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
