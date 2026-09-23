import { IStaff } from '../../core/interfaces/staff.interface';

function base64UrlEncode(value: unknown): string {
  const json = JSON.stringify(value);
  const base64 = btoa(unescape(encodeURIComponent(json)));

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
delete later
 */
export function createDevAccessToken(staff: IStaff): string {
  const header = base64UrlEncode({ alg: 'none', typ: 'JWT' });
  const payload = base64UrlEncode({
    sub: staff.staffId,
    name: staff.name,
    username: staff.uid,
    type: staff.type,
    roles: staff.roles,
  });

  return `${header}.${payload}.dev`;
}
