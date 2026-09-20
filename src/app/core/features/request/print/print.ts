import { Location } from '@angular/common';
import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArrowRight } from '@primeicons/angular/arrow-right';
import { Print } from '@primeicons/angular/print';
import { ButtonDirective } from 'primeng/button';
import { map, switchMap, tap } from 'rxjs';
import { RequestActionTypeEnum } from '../../../enums/request-action-type.enum';
import { RequestsHttpService } from '../../../http-services/requests.http-service';
import { StaffHttpService } from '../../../http-services/staff.http-service';
import { IRequestAction } from '../../../interfaces/request-action.interface';
import { IRequest } from '../../../interfaces/request.interface';
import { IStaff } from '../../../interfaces/staff.interface';

@Component({
  templateUrl: './print.html',
  styleUrl: './print.css',
  encapsulation: ViewEncapsulation.None,
  imports: [ButtonDirective, Print, ArrowRight],
})
export class RequestPrint implements OnInit {
  readonly #activatedRroute = inject(ActivatedRoute);
  readonly #requestsHttpService = inject(RequestsHttpService);
  readonly #staffHttpService = inject(StaffHttpService);

  readonly today = new Date().toLocaleDateString('ar-SA');

  readonly request = signal<IRequest | null>(null);
  readonly studnet = signal<IStaff | null>(null);
  readonly approvals = signal<IRequestAction[]>([]);
  readonly contentReady = signal(false);

  constructor(private location: Location) {}

  ngOnInit(): void {
    const requestId = +this.#activatedRroute.snapshot.paramMap.get('requestId')!;

    this.#requestsHttpService
      .fetchById$(requestId)
      .pipe(
        switchMap((request) =>
          this.#staffHttpService
            .fetchById$(request.staffId)
            .pipe(map((staff) => ({ request, staff }))),
        ),
      )
      .pipe(
        tap(({ request, staff }) => {
          this.request.set(request);
          this.studnet.set(staff);
          this.approvals.set(
            request.actions.filter((action) => action.type === RequestActionTypeEnum.APPROVE),
          );
          this.contentReady.set(true);
        }),
      )
      .subscribe();
  }

  formatDate(date: Date) {
    return date.toLocaleDateString('ar-SA');
  }

  print() {
    window.print();
  }

  goBack(): void {
    this.location.back();
  }
}
