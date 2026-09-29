import { inject, provideAppInitializer } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { GATE_FRONTEND_SERVICE_URL_TOKEN } from '../tokens/gate-frontend-service-url.token';

export const accessTokenInitilizer = provideAppInitializer(() => {
  const authService = inject(AuthService);
  const gateFrontendServiceUrl = inject(GATE_FRONTEND_SERVICE_URL_TOKEN);
  const originUrl = new URL(window.location.href);

  authService.restoreAccessToken();

  if (authService.accessToken) {
    return;
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
