import { Injectable } from '@angular/core';
import { IHttpFetchPayload } from '../interfaces/http-fetch-payload.interface';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class HttpService {
  fetchPayloadToParams({ searchTxt, skip, take }: IHttpFetchPayload) {
    let params = new HttpParams();

    if (searchTxt) {
      params = params.append('searchTxt', searchTxt);
    }

    if (skip || skip === 0) {
      params = params.append('skip', skip);
    }

    if (take) {
      params = params.append('take', take);
    }

    return params;
  }
}
