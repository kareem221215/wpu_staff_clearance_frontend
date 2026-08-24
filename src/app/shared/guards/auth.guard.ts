import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: (shouldBeAuthenticated: boolean) => CanActivateFn =
  (shouldBeAuthenticated) => () => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const isAuthenticated = authService.isAuthenticated;

    if (isAuthenticated === shouldBeAuthenticated) {
      return true;
    }

    let path = ['/'];

    if (!isAuthenticated) {
      path = ['/login'];
    }

    const queryParams: Record<string, string> = {};

    new URL(window.location.href).searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });

    return router.createUrlTree(path, { queryParams, queryParamsHandling: 'merge' });
  };
