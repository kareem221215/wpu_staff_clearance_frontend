import { HttpContextToken } from '@angular/common/http';

export const CACHE_HTTP_CONTEXT_TOKEN = new HttpContextToken<boolean>(() => false);
