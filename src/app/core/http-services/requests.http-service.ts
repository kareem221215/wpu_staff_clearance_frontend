import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { IHttpFetchPayload } from '../../shared/interfaces/http-fetch-payload.interface';
import { IHttpListResponse } from '../../shared/interfaces/http-list-response.interface';
import { IHttpResponse } from '../../shared/interfaces/http-response.interface';
import { HttpService } from '../../shared/services/http.service';
import { STAFF_CLEARANCE_APIS_SERVICE_URL_TOKEN } from '../../shared/tokens/staff-clearance-apis-service-url.token';
import { RequestActionTypeEnum } from '../enums/request-action-type.enum';
import { IRequest } from '../interfaces/request.interface';

interface IRequestsHttpFetchPayload {
  readonly archived?: boolean;
  readonly completed?: boolean;
  readonly departmentIds?: number[];
  readonly employeeIds?: number[];
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

    return this.#httpClient
      .get<IHttpListResponse<IRequest>>(this.#baseUrl, {
        params,
      })
      .pipe(map(({ data, total }) => ({ data: data.map(this.#mapRequest), total })));
  }

  fetchById$(requestId: number) {
    const url = [this.#baseUrl, requestId].join('/');

    return this.#httpClient
      .get<IHttpResponse<IRequest>>(url)
      .pipe(map(({ data }) => this.#mapRequest(data)));
  }

  takeAction$(requestId: number, type: RequestActionTypeEnum, note: string | null = null) {
    const url = [this.#baseUrl, requestId, 'actions'].join('/');

    return this.#httpClient.post<void>(url, { type, note });
  }

  create$() {
    return this.#httpClient.post<void>(this.#baseUrl, {});
  }

  #handleRequestsHttpFetchPayload(params: HttpParams, payload: IRequestsHttpFetchPayload) {
    if (payload.departmentIds) {
      params = params.append('departmentIds', payload.departmentIds.join(','));
    }

    if (payload.employeeIds) {
      params = params.append('employeeIds', payload.employeeIds.join(','));
    }

    if (payload.completed !== undefined) {
      params = params.append('completed', payload.completed);
    }

    if (payload.archived !== undefined) {
      params = params.append('archived', payload.archived);
    } else if (payload.completed === undefined) {
      params = params.append('archived', false);
    }

    return params;
  }

  #mapRequest = ({ actions, ...request }: IRequest) => ({
    ...request,
    actions: actions
      .filter(
        ({ type, role }) =>
          type !== RequestActionTypeEnum.REJECT ||
          actions.every(
            (action) => action.role !== role || action.type !== RequestActionTypeEnum.APPROVE,
          ),
      )
      .map(({ takenAt, ...action }) => ({ ...action, takenAt: new Date(takenAt) }))
      .sort((a, b) => (a.takenAt > b.takenAt ? 1 : -1)),
  });
}
