import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { STAFF_CLEARANCE_APIS_SERVICE_URL_TOKEN } from '../../shared/tokens/staff-clearance-apis-service-url.token';
import { IStats } from '../interfaces/stats.interface';

@Injectable({ providedIn: 'root' })
export class StatsHttpService {
  readonly #docsApisServiceUrl = inject(STAFF_CLEARANCE_APIS_SERVICE_URL_TOKEN);
  readonly #httpClient = inject(HttpClient);

  readonly #baseUrl = `${this.#docsApisServiceUrl}/stats`;

  fetch$() {
    return this.#httpClient.get<IStats>(this.#baseUrl);
  }
}
