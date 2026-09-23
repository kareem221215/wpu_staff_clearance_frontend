import { inject, isDevMode, provideAppInitializer } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { GATE_FRONTEND_SERVICE_URL_TOKEN } from '../tokens/gate-frontend-service-url.token';
import { createDevAccessToken } from '../mock-data/dev-token.util';
import { DIRECT_MANAGERS, MANAGERS, STAFF } from '../mock-data/users.mock';

export const accessTokenInitilizer = provideAppInitializer(() => {
  const authService = inject(AuthService);
  const gateFrontendServiceUrl = inject(GATE_FRONTEND_SERVICE_URL_TOKEN);
  const originUrl = new URL(window.location.href);

  authService.restoreAccessToken();

  if (authService.accessToken) {
    return;
  }

  //delete later
  if (isDevMode()) {
    const devUserId =
      originUrl.searchParams.get('staffId') ?? originUrl.searchParams.get('managerId');

    if (devUserId) {
      const user = [...STAFF, ...DIRECT_MANAGERS, ...MANAGERS].find(
        (s) => s.staffId === Number(devUserId),
      );

      if (user) {
        authService.storeAccessToken(createDevAccessToken(user));

        // Always land on '/' so the role-based redirect (staff vs manager)
        // picks the right page — regardless of which path this was typed on.
        return window.location.replace(new URL('/', originUrl));
      }
    }
  }

  const accessToken = originUrl.searchParams.get('access_token');

  if (accessToken) {
    authService.storeAccessToken(accessToken);

    originUrl.searchParams.delete('access_token');
    originUrl.searchParams.delete('checked');

    return window.location.replace(originUrl);
  }

  const checked = originUrl.searchParams.get('checked') === 'true';

  if (!checked) {
    const url = new URL(gateFrontendServiceUrl);
    url.searchParams.append('action', 'check');
    url.searchParams.append('redirect_to', window.location.href);

    window.location.replace(url);
  }
});
