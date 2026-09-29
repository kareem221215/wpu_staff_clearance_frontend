import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { IHttpFetchPayload } from '../../shared/interfaces/http-fetch-payload.interface';
import { IHttpListResponse } from '../../shared/interfaces/http-list-response.interface';
import { IHttpResponse } from '../../shared/interfaces/http-response.interface';
import { HttpService } from '../../shared/services/http.service';
import { STAFF_CLEARANCE_APIS_SERVICE_URL_TOKEN } from '../../shared/tokens/staff-clearance-apis-service-url.token';
import { IDecision } from '../interfaces/decision.interface';
import { IRequestCreate } from '../interfaces/request-create.interface';

interface IDecisionsHttpFetchPayload {
  readonly departmentIds?: number[];
}

@Injectable({ providedIn: 'root' })
export class DecisionsHttpService {
  readonly #staffClearanceApisServiceUrl = inject(STAFF_CLEARANCE_APIS_SERVICE_URL_TOKEN);
  readonly #httpClient = inject(HttpClient);
  readonly #httpService = inject(HttpService);

  readonly #baseUrl = `${this.#staffClearanceApisServiceUrl}/decisions`;

  fetch$(payload: IHttpFetchPayload & IDecisionsHttpFetchPayload) {
    const params = this.#handleDecisionsHttpFetchPayload(
      this.#httpService.fetchPayloadToParams(payload),
      payload,
    );

    return this.#httpClient
      .get<IHttpListResponse<IDecision>>(this.#baseUrl, {
        params,
      })
      .pipe(
        map(({ data, total }) => ({
          data: data.map((req) => this.#mapDecision({ data: req })),
          total,
        })),
      );
  }

  fetchById$(decisionId: number) {
    return this.#httpClient.get<IHttpResponse<IDecision>>(`${this.#baseUrl}/${decisionId}`);
  }

  create$(departmentId: number, data: IRequestCreate[]) {
    return this.#httpClient.post<void>(this.#baseUrl, { departmentId, requests: data });
  }

  #handleDecisionsHttpFetchPayload(params: HttpParams, payload: IDecisionsHttpFetchPayload) {
    if (payload.departmentIds) {
      params = params.append('departmentIds', payload.departmentIds.join(','));
    }

    return params;
  }

  #mapDecision = ({ data: { createdAt, ...decision } }: IHttpResponse<IDecision>) => ({
    ...decision,
    createdAt: new Date(createdAt),
  });
}
