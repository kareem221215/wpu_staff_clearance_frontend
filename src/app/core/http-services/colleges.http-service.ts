import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { of } from 'rxjs';
import { CACHE_HTTP_CONTEXT_TOKEN } from '../../shared/http-context-tokens/cache.http-context-token';
import { AuthService } from '../../shared/services/auth.service';
import { GATE_APIS_SERVICE_URL_TOKEN } from '../../shared/tokens/gate-apis-service-url.token';
import { ICollege } from '../interfaces/college.interface';

@Injectable({ providedIn: 'root' })
export class CollegesHttpService {
  readonly #authService = inject(AuthService);
  readonly #httpClient = inject(HttpClient);
  readonly #gateApisServiceUrl = inject(GATE_APIS_SERVICE_URL_TOKEN);

  readonly #baseUrl = `${this.#gateApisServiceUrl}/colleges`;

  fetch$() {
    if (!this.#authService.isAdmin) {
      return of([]);
    }

    return this.#httpClient.get<ICollege[]>(this.#baseUrl, {
      context: new HttpContext().set(CACHE_HTTP_CONTEXT_TOKEN, true),
    });
  }
}
