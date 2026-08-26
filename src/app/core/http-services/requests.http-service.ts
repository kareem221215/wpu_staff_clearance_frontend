import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IHttpFetchPayload } from '../../shared/interfaces/http-fetch-payload.interface';
import { IHttpListResponse } from '../../shared/interfaces/http-list-response.interface';
import { HttpService } from '../../shared/services/http.service';
import { STAFF_CLEARANCE_APIS_SERVICE_URL_TOKEN } from '../../shared/tokens/staff-clearance-apis-service-url.token';
import { IRequestApproval } from '../interfaces/request-approval.interface';
import { IRequest } from '../interfaces/request.interface';
import { map } from 'rxjs';
import { IHttpResponse } from '../../shared/interfaces/http-response.interface';

interface IRequestsHttpFetchPayload {
  readonly collegeIds?: number[];
  readonly completed?: boolean;
  readonly incompleted?: boolean;
  readonly staffIds?: number[];
}

@Injectable({ providedIn: 'root' })
export class RequestsHttpService {
  readonly #staffClearanceApisServiceUrl = inject(STAFF_CLEARANCE_APIS_SERVICE_URL_TOKEN);
  readonly #httpClient = inject(HttpClient);
  readonly #httpService = inject(HttpService);

  readonly #baseUrl = `${this.#staffClearanceApisServiceUrl}/requests`;

  fetch$(payload: IHttpFetchPayload & IRequestsHttpFetchPayload) {
    const params = this.#handleRequestsHttpFetchPayload(
      this.#httpService.fetchPayloadToParams(payload),
      payload,
    );

    return this.#httpClient.get<IHttpListResponse<IRequest>>(this.#baseUrl, {
      params,
    });
  }

  fetchById$(requestId: number) {
    return this.#httpClient.get<IRequest>(`${this.#baseUrl}/${requestId}`);
  }

  fetchBytaffId$(staffId: number) {
    return this.#httpClient.get<IRequest>(`${this.#baseUrl}/one-by-staff/${staffId}`);
  }

  fetchApprovals$(requestId: number) {
    return this.#httpClient.get<IRequestApproval[]>(`${this.#baseUrl}/${requestId}/approvals`).pipe(
      map((approvals) =>
        approvals.map(({ createdAt, ...approval }) => ({
          createdAt: new Date(createdAt),
          ...approval,
        })),
      ),
    );
  }

  // delete$(requestId: number) {
  //   const url = [this.#baseUrl, requestId].join('/');

  //   return this.#httpClient.delete<void>(url);
  // }

  approve$(requestId: number, approved = true, note: string | null = null) {
    const url = [this.#baseUrl, requestId, 'approve'].join('/');

    return this.#httpClient.post<void>(url, { approved, note });
  }

  create$(data: { staffId: number }) {
    return this.#httpClient.post<void>(this.#baseUrl, data);
  }

  #handleRequestsHttpFetchPayload(params: HttpParams, payload: IRequestsHttpFetchPayload) {
    if (payload.collegeIds) {
      params = params.append('collegeIds', payload.collegeIds.join(','));
    }

    if (payload.staffIds) {
      params = params.append('staffIds', payload.staffIds.join(','));
    }

    if (payload.completed !== undefined) {
      params = params.append('completed', payload.completed);
    }

    if (payload.incompleted !== undefined) {
      params = params.append('incompleted', payload.incompleted);
    }

    return params;
  }
}
