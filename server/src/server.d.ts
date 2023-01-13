import { fetch as _fetch } from 'undici/types/fetch';

declare global {
  const fetch: typeof _fetch;
}
