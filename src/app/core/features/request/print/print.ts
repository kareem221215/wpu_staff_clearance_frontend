import { Location, NgClass } from '@angular/common';
import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArrowRight } from '@primeicons/angular/arrow-right';
import { Print } from '@primeicons/angular/print';
import { ButtonDirective } from 'primeng/button';
import { tap } from 'rxjs';
import { RequestApprovalStatusEnum } from '../../../enums/request-approval-status.enum';
import { StaffHttpService } from '../../../http-services/staff.http-service';
import { IRequestApproval } from '../../../interfaces/request-approval.interface';
import { IRequest } from '../../../interfaces/request.interface';
import { IStaff } from '../../../interfaces/staff.interface';
import { deriveApprovals } from '../../../utils/pipeline.utils';

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
  selector: 'app-request-print',
})
export class RequestPrint implements OnInit {
  readonly #activatedRoute = inject(ActivatedRoute);
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
    const routeState = window.history.state as { request?: IRequest };
    const request = routeState?.request ?? null;

    if (!request) {
      this.error.set('لم يتم العثور على الطلب — يرجى فتح الطباعة من قائمة الطلبات');
      this.loading.set(false);

      return;
    }

    this.request.set(request);
    this.approvals.set([...deriveApprovals(request)].sort((a, b) => a.order - b.order));

    this.#staffHttpService
      .fetchById$(request.employeeId)
      .pipe(tap((staff) => this.staff.set(staff)))
      .subscribe(() => this.loading.set(false));
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
