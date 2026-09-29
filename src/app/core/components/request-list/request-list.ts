import { NgClass } from '@angular/common';
import { Component, inject, model, OnChanges, signal, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Bolt } from '@primeicons/angular/bolt';
import { Building } from '@primeicons/angular/building';
import { CheckCircle } from '@primeicons/angular/check-circle';
import { Eye } from '@primeicons/angular/eye';
import { Folder } from '@primeicons/angular/folder';
import { GraduationCap } from '@primeicons/angular/graduation-cap';
import { Hashtag } from '@primeicons/angular/hashtag';
import { Print } from '@primeicons/angular/print';
import { TimesCircle } from '@primeicons/angular/times-circle';
import { ButtonDirective } from 'primeng/button';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { finalize, tap } from 'rxjs';
import { IHttpListResponse } from '../../../shared/interfaces/http-list-response.interface';
import { RequestsHttpService } from '../../http-services/requests.http-service';
import { IRequest } from '../../interfaces/request.interface';
import { RequestsService } from '../../services/requests.service';

export interface IRequestListFilters {
  readonly archived?: boolean;
  readonly departmentId: number | null;
  readonly completed?: boolean;
  readonly skip: number;
  readonly staffId: number | null;
}

@Component({
  imports: [
    Bolt,
    Building,
    ButtonDirective,
    CheckCircle,
    Eye,
    Folder,
    GraduationCap,
    Hashtag,
    NgClass,
    Print,
    Table,
    TimesCircle,
  ],
  selector: 'app-request-list',
  styles: ':host { display: contents; }',
  templateUrl: './request-list.html',
})
export class RequestListTable implements OnChanges {
  readonly #requestsHttpService = inject(RequestsHttpService);
  readonly #requestsService = inject(RequestsService);
  readonly #router = inject(Router);

  readonly filters = model<IRequestListFilters>({
    departmentId: null,
    skip: 0,
    staffId: null,
  });

  protected readonly loading = signal(true);
  protected readonly requestHttpListRes = signal<IHttpListResponse<IRequest>>({
    data: [],
    total: 0,
  });

  protected readonly pageSize = 10;

  ngOnChanges(changes: SimpleChanges): void {
    const { currentValue, firstChange, previousValue } = changes['filters'];
    const currentKeys = currentValue ? Object.keys(currentValue) : [];
    const previousKeys = previousValue ? Object.keys(previousValue) : [];

    if (
      firstChange ||
      currentKeys.length !== previousKeys.length ||
      currentKeys.some((key) => currentValue[key] !== previousValue[key])
    ) {
      this.fetch();
    }
  }

  protected onLazyLoad({ first = 0 }: TableLazyLoadEvent) {
    this.filters.set({ ...this.filters(), skip: first });
  }

  protected fetch() {
    this.loading.set(true);

    const { staffId, ...filters } = this.filters();

    this.#requestsHttpService
      .fetch$({
        ...filters,
        employeeIds: staffId ? [staffId] : undefined,
        take: this.pageSize,
      })
      .pipe(
        tap((res) => {
          this.requestHttpListRes.set(res);
        }),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe();
  }

  protected openViewDialog(request: IRequest) {
    this.#requestsService.openViewDialog(request).then((payload: boolean) => {
      if (payload) {
        this.fetch();
      }
    });
  }

  protected navigateToPrint(request: IRequest) {
    this.#router.navigate(['/request/print', request.requestId], {
      state: { request },
    });
  }

  protected archive(evt: MouseEvent, request: IRequest) {
    this.#requestsService.archive(evt, request).then(() => {
      this.fetch();
    });
  }

  protected approve(evt: MouseEvent, request: IRequest) {
    this.#requestsService.approve(evt, request).then(() => {
      this.fetch();
    });
  }

  protected reject(request: IRequest) {
    this.#requestsService.reject(request).then((rejected) => {
      if (rejected) {
        this.fetch();
      }
    });
  }

  protected approvedCount(request: IRequest) {
    return request.actions.filter((a) => a.type === 'approve').length;
  }

  protected canApprove(request: IRequest) {
    return this.#requestsService.canApprove(request);
  }

  protected canReject(request: IRequest) {
    return this.#requestsService.canReject(request);
  }

  protected canArchive(request: IRequest) {
    return this.#requestsService.canArchive(request);
  }

  protected canPrint(request: IRequest) {
    return this.#requestsService.canPrint(request);
  }
}
