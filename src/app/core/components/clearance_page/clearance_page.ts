import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Bolt } from '@primeicons/angular/bolt';
import { Building } from '@primeicons/angular/building';
import { CheckCircle } from '@primeicons/angular/check-circle';
import { ExclamationTriangle } from '@primeicons/angular/exclamation-triangle';
import { Eye } from '@primeicons/angular/eye';
import { GraduationCap } from '@primeicons/angular/graduation-cap';
import { Hashtag } from '@primeicons/angular/hashtag';
import { Print } from '@primeicons/angular/print';
import { TimesCircle } from '@primeicons/angular/times-circle';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ButtonDirective } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Select } from 'primeng/select';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { IHttpListResponse } from '../../../shared/interfaces/http-list-response.interface';
import { AuthService } from '../../../shared/services/auth.service';
import { CollegesHttpService } from '../../http-services/colleges.http-service';
import { RequestsHttpService } from '../../http-services/requests.http-service';
import { StaffHttpService } from '../../http-services/staff.http-service';
import { IRequest } from '../../interfaces/request.interface';
import { IStaff } from '../../interfaces/staff.interface';
import { RequestsService } from '../../services/requests.service';
import { ShellService } from '../../services/shell.service';

@Component({
  selector: 'app-clearance-page',
  templateUrl: './clearance_page.html',
  styles: ':host { display: contents; }',
  imports: [
    AutoComplete,
    Bolt,
    Building,
    ButtonDirective,
    CheckCircle,
    ExclamationTriangle,
    Eye,
    FormsModule,
    GraduationCap,
    Hashtag,
    IconField,
    InputIcon,
    NgClass,
    Print,
    RouterLink,
    Select,
    TableModule,
    TimesCircle,
  ],
})
export class ClearancePage implements OnInit {
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #authService = inject(AuthService);
  readonly #collegesHttpService = inject(CollegesHttpService);
  readonly #requestsHttpService = inject(RequestsHttpService);
  readonly #requestsService = inject(RequestsService);
  readonly #router = inject(Router);
  readonly #shellService = inject(ShellService);
  readonly #staffHttpService = inject(StaffHttpService);

  readonly toolbarTpl = viewChild<TemplateRef<void>>('toolbarTpl');

  readonly pageSize = 10;

  readonly loading = signal(true);
  readonly requests = signal<IHttpListResponse<IRequest>>({ data: [], total: 0 });
  readonly searchTxt = signal('');
  readonly skip = signal(0);
  readonly staffs = signal<IStaff[]>([]);

  readonly colleges = toSignal(this.#collegesHttpService.fetch$(), { initialValue: [] });
  readonly isAdmin = toSignal(this.#authService.isAdmin$);
  readonly isSuperAdmin = toSignal(this.#authService.isSuperAdmin$);

  readonly #search = {
    completed: undefined as boolean | undefined,
    incompleted: undefined as boolean | undefined,
  };

  collegeId: number | null = null;
  staff: IStaff | null = null;

  constructor() {
    let first = true;

    this.#activatedRoute.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe(({ completed, collegeId, incompleted, skip, staffId }) => {
        this.collegeId = collegeId ? +collegeId : null;
        this.#search.completed = completed ? completed === 'true' : undefined;
        this.#search.incompleted = incompleted ? incompleted === 'true' : undefined;

        this.skip.set(skip ? +skip : 0);

        if (staffId) {
          if (first) {
            this.#staffHttpService.fetchById$(+staffId).subscribe((staff) => {
              this.staff = staff;

              this.fetch();
            });
          } else {
            this.fetch();
          }
        } else {
          this.staff = null;

          this.fetch();
        }

        first = false;
      });
  }

  ngOnInit(): void {
    this.#shellService.setToolbarTpl(this.toolbarTpl());
  }

  //   openRequestViewDialog(request: IRequest) {
  //     this.#requestsService.openViewDialog(request).then((payload: boolean) => {
  //       if (payload) {
  //         this.fetch();
  //       }
  //     });
  //   }

  onLazyLoad({ first = 0 }: TableLazyLoadEvent) {
    this.#router.navigate([], {
      queryParams: { skip: first || undefined },
      queryParamsHandling: 'merge',
    });
  }

  fetch() {
    this.loading.set(true);

    this.#requestsHttpService
      .fetch$({
        ...this.#search,
        collegeIds: this.collegeId ? [this.collegeId] : undefined,
        skip: this.skip(),
        staffIds: this.staff ? [this.staff.staffId] : undefined,
        take: this.pageSize,
      })
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe((requests) => {
        this.requests.set(requests);
      });
  }

  export() {
    // this.#requestsHttpService.export$(this.#search).subscribe((file) => {
    //   const url = window.URL.createObjectURL(new Blob([file]));
    //   const link = document.createElement('a');
    //   link.href = url;
    //   link.setAttribute('download', 'الطلبات.xlsx');
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    //   window.URL.revokeObjectURL(url);
    // });
  }

  //   onSearchStudent({ query }: AutoCompleteCompleteEvent) {
  //     this.#staffHttpService.fetch$({ searchTxt: query, take: 5 }).subscribe(({ data }) => {
  //       this.staff.set([...data]);
  //     });
  //   }

  //   onSearch(prop: 'collegeId' | 'studentId', val?: number) {
  //     this.#router.navigate([], {
  //       queryParams: { [prop]: val || undefined, skip: undefined },
  //       queryParamsHandling: 'merge',
  //     });
  //   }

  approve(evt: MouseEvent, request: IRequest) {
    this.#requestsService.approve(evt, request).then(() => {
      this.fetch();
    });
  }

  //   reject(request: IRequest) {
  //     this.#requestsService.reject(request).then((rejected) => {
  //       if (rejected) {
  //         this.fetch();
  //       }
  //     });
  //   }

  delete(evt: MouseEvent, request: IRequest) {
    // this.#requestsService.delete(evt, request).then(() => {
    //   this.fetch();
    // });
  }

  needsAction(request: IRequest) {
    return this.#requestsService.canTakeAction(request);
  }

  canPrint() {
    return this.#requestsService.canPrint();
  }
}
