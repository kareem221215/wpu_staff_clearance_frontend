import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRoleEnum } from '../enums/user-role.enum';
import { AuthService } from '../services/auth.service';

export const canSeeDecisionsGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (
    authService.hasRoles([
      UserRoleEnum.ADMIN,
      // UserRoleEnum.CENTRAL_AFFAIRS_MANAGER,
      // UserRoleEnum.CENTRAL_GRADUATE_TRACKING_MANAGER,
    ])
  ) {
    return true;
  }

  return router.createUrlTree(['/']);
};
