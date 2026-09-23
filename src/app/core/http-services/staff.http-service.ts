import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CACHE_HTTP_CONTEXT_TOKEN } from '../../shared/http-context-tokens/cache.http-context-token';
import { IHttpFetchPayload } from '../../shared/interfaces/http-fetch-payload.interface';
import { IHttpListResponse } from '../../shared/interfaces/http-list-response.interface';
import { HttpService } from '../../shared/services/http.service';
import { STAFF_CLEARANCE_APIS_SERVICE_URL_TOKEN } from '../../shared/tokens/staff-clearance-apis-service-url.token';
import { IStaff } from '../interfaces/staff.interface';

@Injectable({ providedIn: 'root' })
export class StaffHttpService {
  readonly #docsApisServiceUrl = inject(STAFF_CLEARANCE_APIS_SERVICE_URL_TOKEN);
  readonly #httpClient = inject(HttpClient);
  readonly #httpService = inject(HttpService);

  readonly #baseUrl = `${this.#docsApisServiceUrl}/staff`;
  readonly #managersUrl = `${this.#docsApisServiceUrl}/managers`;

  fetch$(payload: IHttpFetchPayload & { collegeIds?: number[] }) {
    let params = this.#httpService.fetchPayloadToParams(payload);

    if (payload.collegeIds) {
      params = params.append('collegeIds', payload.collegeIds.join(','));
    }

    return this.#httpClient.get<IHttpListResponse<IStaff>>(this.#baseUrl, {
      params,
      context: new HttpContext().set(CACHE_HTTP_CONTEXT_TOKEN, true),
    });
  }

  fetchManagers$(payload: IHttpFetchPayload & { collegeIds?: number[] }) {
    let params = this.#httpService.fetchPayloadToParams(payload);

    if (payload.collegeIds) {
      params = params.append('collegeIds', payload.collegeIds.join(','));
    }

    return this.#httpClient.get<IHttpListResponse<IStaff>>(this.#managersUrl, {
      params,
      context: new HttpContext().set(CACHE_HTTP_CONTEXT_TOKEN, true),
    });
  }

  fetchById$(id: number) {
    return this.#httpClient.get<IStaff>(`${this.#baseUrl}/${id}`, {
      context: new HttpContext().set(CACHE_HTTP_CONTEXT_TOKEN, true),
    });
  }
}
