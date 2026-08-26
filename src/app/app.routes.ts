import { Routes } from '@angular/router';
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
        pathMatch: 'full',
        loadComponent: () =>
          import('./core/components/clearance_page/clearance_page').then((c) => c.ClearancePage),
      },
    ],
  },

  {
    path: 'login',
    canActivate: [authGuard(false)],
    loadComponent: () => import('./core/components/login/login').then((c) => c.Login),
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '/',
  },
];
