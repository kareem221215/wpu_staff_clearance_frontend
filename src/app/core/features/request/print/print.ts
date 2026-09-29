import { Location, NgClass } from '@angular/common';
import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArrowRight } from '@primeicons/angular/arrow-right';
import { Print } from '@primeicons/angular/print';
import { ButtonDirective } from 'primeng/button';
import { catchError, forkJoin, of, switchMap, tap } from 'rxjs';
import { RequestApprovalStatusEnum } from '../../../enums/request-approval-status.enum';
import { RequestsHttpService } from '../../../http-services/requests.http-service';
import { StaffHttpService } from '../../../http-services/staff.http-service';
import { IRequestApproval } from '../../../interfaces/request-approval.interface';
import { IRequest } from '../../../interfaces/request.interface';
import { IStaff } from '../../../interfaces/staff.interface';

const STATUS_LABEL: Record<RequestApprovalStatusEnum, string> = {
  [RequestApprovalStatusEnum.APPROVED]: 'تمت الموافقة',
  [RequestApprovalStatusEnum.REJECTED]: 'مرفوض',
  [RequestApprovalStatusEnum.PENDING]: 'معلق',
};

@Component({
  templateUrl: './print.html',
  styleUrl: './print.css',
  encapsulation: ViewEncapsulation.None,
  imports: [ButtonDirective, NgClass, Print, ArrowRight],
})
export class RequestPrint implements OnInit {
  readonly #activatedRroute = inject(ActivatedRoute);
  readonly #requestsHttpService = inject(RequestsHttpService);
  readonly #staffHttpService = inject(StaffHttpService);

  readonly RequestApprovalStatusEnum = RequestApprovalStatusEnum;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly request = signal<IRequest | null>(null);
  readonly staff = signal<IStaff | null>(null);
  readonly approvals = signal<IRequestApproval[]>([]);

  readonly printDate = signal(new Date().toISOString().split('T')[0]);

  constructor(private location: Location) {}

  ngOnInit(): void {
    const requestId = +this.#activatedRroute.snapshot.paramMap.get('requestId')!;

    this.#requestsHttpService
      .fetchById$(requestId)
      .pipe(
        tap((request) => {
          this.request.set(request);
        }),
        switchMap((request) =>
          forkJoin({
            staff: this.#staffHttpService.fetchById$(request.staffId),
            approvals: this.#requestsHttpService.fetchApprovals$(requestId),
          }),
        ),
        tap(({ staff, approvals }) => {
          this.staff.set(staff);
          this.approvals.set([...approvals].sort((a, b) => a.order - b.order));
        }),
        catchError(() => {
          this.error.set('لم يتم العثور على الطلب');

          return of(null);
        }),
      )
      .subscribe(() => {
        this.loading.set(false);
      });
  }

  statusLabel(status: RequestApprovalStatusEnum) {
    return STATUS_LABEL[status];
  }

  onPrintDateChange(event: Event) {
    this.printDate.set((event.target as HTMLInputElement).value);
  }

  formatPrintDate() {
    const date = this.printDate();

    return date
      ? new Date(date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '............';
  }

  print() {
    window.print();
  }

  goBack(): void {
    this.location.back();
  }
}
