import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CACHE_HTTP_CONTEXT_TOKEN } from '../../shared/http-context-tokens/cache.http-context-token';
import { STAFF_CLEARANCE_APIS_SERVICE_URL_TOKEN } from '../../shared/tokens/staff-clearance-apis-service-url.token';
import { IDepartment } from '../interfaces/department.interface';

@Injectable({ providedIn: 'root' })
export class DepartmentsHttpService {
  readonly #httpClient = inject(HttpClient);
  readonly #staffClearanceApisServiceUrl = inject(STAFF_CLEARANCE_APIS_SERVICE_URL_TOKEN);

  readonly #baseUrl = `${this.#staffClearanceApisServiceUrl}/departments`;

  fetch$() {
    return this.#httpClient.get<IDepartment[]>(this.#baseUrl, {
      context: new HttpContext().set(CACHE_HTTP_CONTEXT_TOKEN, true),
    });
  }
}
