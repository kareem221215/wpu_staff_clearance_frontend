import { Component, input } from '@angular/core';
import { Bolt } from '@primeicons/angular/bolt';
import { Building } from '@primeicons/angular/building';
import { InfoCircle } from '@primeicons/angular/info-circle';
import { Spinner } from '@primeicons/angular/spinner';
import { User } from '@primeicons/angular/user';
import { Popover } from 'primeng/popover';
import { TableModule } from 'primeng/table';
import { RequestApprovalStatusEnum } from '../../enums/request-approval-status.enum';
import { IRequestApproval } from '../../interfaces/request-approval.interface';

@Component({
  selector: 'app-approval-list',
  imports: [Bolt, Building, InfoCircle, Popover, Spinner, TableModule, User],
  styles: ':host { display: contents; }',
  templateUrl: './approval-list.html',
})
export class ApprovalList {
  protected readonly RequestApprovalStatusEnum = RequestApprovalStatusEnum;

  readonly approvals = input.required<IRequestApproval[]>();
  readonly loading = input(false);
}
