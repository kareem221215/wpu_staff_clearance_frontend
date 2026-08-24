import { IHttpResponse } from './http-response.interface';

export interface IHttpListResponse<T> extends IHttpResponse<T[]> {
  readonly total: number;
}
