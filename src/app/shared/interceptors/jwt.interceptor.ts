import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export function jwtInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const accessToken = inject(AuthService).accessToken;

  if (!accessToken) {
    return next(req);
  }

  return next(
    req.clone({
      headers: req.headers.append('Authorization', `Bearer ${accessToken}`),
    }),
  );
}
