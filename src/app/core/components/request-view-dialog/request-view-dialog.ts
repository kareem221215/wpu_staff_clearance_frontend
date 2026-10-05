import { Component, computed, inject, input, resource } from '@angular/core';
import { CheckCircle } from '@primeicons/angular/check-circle';
import { ExclamationTriangle } from '@primeicons/angular/exclamation-triangle';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Message } from 'primeng/message';
import { lastValueFrom } from 'rxjs';
import { DialogContainer } from '../../../shared/components/dialog-container/dialog-container';
import { RequestsHttpService } from '../../http-services/requests.http-service';
import { RequestPolicyService } from '../../services/request-policy.service';
import { ApproveButton } from '../buttons/approve-button/approve-button';
import { ArchiveButton } from '../buttons/archive-button/archive-button';
import { PrintButton } from '../buttons/print-button/print-button';
import { RejectButton } from '../buttons/reject-button/reject-button';
import { RequestView } from '../request-view/request-view';

@Component({
  imports: [
    ApproveButton,
    ArchiveButton,
    CheckCircle,
    DialogContainer,
    ExclamationTriangle,
    Message,
    PrintButton,
    RejectButton,
    RequestView,
  ],
  selector: 'app-request-view-dialog',
  styles: ':host { display: contents; }',
  templateUrl: './request-view-dialog.html',
})
export class RequestViewDialog {
  readonly #ref = inject(DynamicDialogRef);
  readonly #requestPolicyService = inject(RequestPolicyService);
  readonly #requestsHttpService = inject(RequestsHttpService);

  readonly requestId = input.required<number>();

  protected readonly requestResource = resource({
    loader: ({ params: requestId }) =>
      lastValueFrom(this.#requestsHttpService.fetchById$(requestId)),
    params: () => this.requestId(),
  });

  protected readonly title = computed(() => {
    if (this.requestResource.isLoading()) {
      return 'جاري التحميل...';
    }
    if (this.requestResource.error()) {
      return 'حدث خطأ أثناء تحميل الطلب';
    }
    if (this.requestResource.hasValue()) {
      return `طلب الموظف(ة) ${this.requestResource.value()!.employeeName}`;
    }
    return 'لم يتم العثور على الطلب';
  });

  protected readonly isCompleted = computed(() => {
    return this.#requestPolicyService.isCompleted(this.requestResource.value()!);
  });

  protected readonly canTakeAction = computed(() => {
    const request = this.requestResource.value();

    if (!request) {
      return false;
    }

    return this.#requestPolicyService.canTakeAction(request);
  });

  close() {
    this.#ref.close();
  }

  onAction(actionTaken: boolean) {
    this.#ref.close(actionTaken);
  }
}
