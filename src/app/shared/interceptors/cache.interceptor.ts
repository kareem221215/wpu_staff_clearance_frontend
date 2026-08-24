import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { CACHE_HTTP_CONTEXT_TOKEN } from '../http-context-tokens/cache.http-context-token';

const cacheMap = new Map<string, HttpResponse<unknown>>();

export function cacheInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  if (req.context.get(CACHE_HTTP_CONTEXT_TOKEN)) {
    const key = req.urlWithParams;
    const cachedResponse = cacheMap.get(key);

    if (cachedResponse) {
      return of(cachedResponse.clone());
    }

    return next(req).pipe(
      tap((evt) => {
        if (evt instanceof HttpResponse) {
          cacheMap.set(key, evt.clone());
        }
      }),
    );
  }

  return next(req);
}
