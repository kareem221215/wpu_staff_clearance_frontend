import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { UserRoleEnum } from '../../shared/enums/user-role.enum';
import { DepartmentsHttpService } from '../http-services/colleges.http-service';

@Injectable({ providedIn: 'root' })
export class DepartmentsService {
  readonly #departmentsHttpService = inject(DepartmentsHttpService);

  readonly #departments = toSignal(
    this.#departmentsHttpService.fetch$().pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  // The role whose holder is this department's direct manager. Matched by
  // role (not a specific person's id) since that's how actions are recorded
  // and how turn-taking (nextActionRole) already works everywhere else —
  // matching by id would silently break as soon as the direct manager changes.
  directManagerRoleFor(departmentId: number): UserRoleEnum | null {
    return (
      this.#departments().find((department) => department.departmentId === departmentId)
        ?.managerRoleAlias ?? null
    );
  }
}
