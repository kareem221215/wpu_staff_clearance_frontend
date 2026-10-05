import { Component, computed, inject, OnInit, resource, signal, TemplateRef, viewChild } from '@angular/core';
import { CheckCircle } from '@primeicons/angular/check-circle';
import { ExclamationTriangle } from '@primeicons/angular/exclamation-triangle';
import { Send } from '@primeicons/angular/send';
import { Spinner } from '@primeicons/angular/spinner';
import { ButtonDirective } from 'primeng/button';
import { Message } from 'primeng/message';
import { finalize, lastValueFrom, map } from 'rxjs';
import { AuthService } from '../../../shared/services/auth.service';
import { RequestView } from '../../components/request-view/request-view';
import { RequestsHttpService } from '../../http-services/requests.http-service';
import { RequestPolicyService } from '../../services/request-policy.service';
import { ShellService } from '../../services/shell.service';
import { ToastService } from '../../services/toast.service';

@Component({
  imports: [ButtonDirective, CheckCircle, ExclamationTriangle, Message, RequestView, Send, Spinner],
  selector: 'app-clearance',
  styles: ':host { display: contents; }',
  templateUrl: './clearance.html',
})
export class Clearance implements OnInit {
  readonly #authService = inject(AuthService);
  readonly #requestPolicyService = inject(RequestPolicyService);
  readonly #requestsHttpService = inject(RequestsHttpService);
  readonly #shellService = inject(ShellService);
  readonly #toastService = inject(ToastService);

  readonly toolbarTpl = viewChild<TemplateRef<void>>('toolbarTpl');

  readonly creating = signal(false);

  protected readonly requestResource = resource({
    loader: ({ params: employeeId }) =>
      lastValueFrom(
        this.#requestsHttpService
          .fetch$({ employeeIds: [employeeId], take: 1 })
          .pipe(map(({ data }) => data[0])),
      ),
    params: () => this.#authService.staffId ?? undefined,
  });

  protected readonly isCompleted = computed(() => {
    const request = this.requestResource.value();

    return !!request && this.#requestPolicyService.isCompleted(request);
  });

  protected readonly canCreate = computed(
    () =>
      this.#authService.isStaff &&
      !this.requestResource.isLoading() &&
      !this.requestResource.error() &&
      !this.requestResource.value(),
  );

  ngOnInit(): void {
    this.#shellService.setToolbarTpl(this.toolbarTpl());
  }

  create() {
    this.creating.set(true);

    this.#requestsHttpService
      .create$()
      .pipe(finalize(() => this.creating.set(false)))
      .subscribe(() => {
        this.#toastService.success('تم إنشاء طلب براءة الذمة بنجاح');

        this.requestResource.reload();
      });
  }
}
