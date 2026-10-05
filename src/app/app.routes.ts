import { Routes } from '@angular/router';
import { canSeeDecisionsGuard } from './shared/guards/can-see-decisions.guard';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard(true)],
    loadComponent: () => import('./core/components/shell/shell').then((c) => c.Shell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./core/components/root-redirect/root-redirect').then((c) => c.RootRedirect),
      },
      {
        path: 'clearance',
        loadComponent: () =>
          import('./core/features/clearance/clearance').then((c) => c.Clearance),
      },
      {
        path: 'request',
        children: [
          {
            path: 'list',
            loadComponent: () =>
              import('./core/features/request/list/list').then((c) => c.RequestList),
          },
        ],
      },
      {
        path: 'stats',
        loadComponent: () => import('./core/features/stats/stats').then((c) => c.Stats),
      },
    ],
  },
  {

    path: 'request/print/:requestId',
    canActivate: [authGuard(true)],
    loadComponent: () => import('./core/features/request/print/print').then((c) => c.RequestPrint),
  },
  {
    path: 'login',
    canActivate: [authGuard(false)],
    loadComponent: () => import('./core/features/login/login').then((c) => c.Login),
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '/',
  },
];
