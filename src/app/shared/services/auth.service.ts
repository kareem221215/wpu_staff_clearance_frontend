import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, map, switchMap } from 'rxjs';
import { UserRoleEnum } from '../enums/user-role.enum';
import { UserTypeEnum } from '../enums/user-type.enum';
import { IAccessTokenPayload } from '../interfaces/access-token-payload.interface';

const accessTokenStorageToken = '$_WPU_ACCESS_TOKEN_$';

@Injectable({ providedIn: 'root' })
export class AuthService {
  #accessToken$ = new BehaviorSubject<string | null>(null);
  #accessTokenPayload$ = new BehaviorSubject<IAccessTokenPayload | null>(null);

  readonly adminRoles = Object.freeze([UserRoleEnum.ADMIN, UserRoleEnum.HUMAN_RESOURCES]);
  readonly superAdminRoles = Object.freeze([UserRoleEnum.ADMIN]);

  get accessToken() {
    return this.#accessToken$.value;
  }

  get accessTokenPayload$() {
    return this.#accessTokenPayload$;
  }

  get isAdmin() {
    return this.#hasRoles(this.accessTokenPayload, this.adminRoles);
  }

  get isAdmin$() {
    return this.#accessTokenPayload$.pipe(
      map((accessTokenPayload) => {
        return this.#hasRoles(accessTokenPayload, this.adminRoles);
      }),
    );
  }

  get isSuperAdmin() {
    return this.#hasRoles(this.accessTokenPayload, this.superAdminRoles);
  }

  get isSuperAdmin$() {
    return this.#accessTokenPayload$.pipe(
      map((accessTokenPayload) => {
        return this.#hasRoles(accessTokenPayload, this.superAdminRoles);
      }),
    );
  }

  get isStaff() {
    return this.#accessTokenPayload$.value?.type === UserTypeEnum.STAFF;
  }

  get staffId() {
    return this.#accessTokenPayload$.value?.sub ?? null;
  }

  get isStaff$() {
    return this.#accessTokenPayload$.pipe(
      map((payload) => payload?.type === UserTypeEnum.STAFF),
    );
  }

  get accessTokenPayload() {
    return this.#accessTokenPayload$.value;
  }

  get isAuthenticated() {
    return !!this.#accessToken$.value;
  }

  get isAuthenticated$() {
    return this.#accessToken$.pipe(map((accessToken) => !!accessToken));
  }

  hasRoles(roles: readonly UserRoleEnum[]) {
    return this.#hasRoles(this.accessTokenPayload, roles);
  }

  setAccessToken(accessToken: string) {
    this.#accessToken$.next(accessToken);

    this.#accessTokenPayload$.next(jwtDecode<IAccessTokenPayload>(accessToken));
  }

  restoreAccessToken() {
    const storedAccessToken = window.sessionStorage.getItem(accessTokenStorageToken);

    if (storedAccessToken) {
      this.setAccessToken(storedAccessToken);
    }
  }

  storeAccessToken(accessToken: string) {
    window.sessionStorage.setItem(accessTokenStorageToken, accessToken);

    this.setAccessToken(accessToken);
  }

  resetAccessToken() {
    window.sessionStorage.removeItem(accessTokenStorageToken);
    window.localStorage.removeItem(accessTokenStorageToken);

    this.#accessToken$.next(null);
    this.#accessTokenPayload$.next(null);
  }

  #hasRoles(accessTokenPayload: IAccessTokenPayload | null, roles: readonly UserRoleEnum[]) {
    if (!accessTokenPayload) {
      return false;
    }

    return accessTokenPayload.roles.some((role) => roles.includes(role));
  }
}
