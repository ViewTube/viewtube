import { Request, RequestInit } from 'undici';
import { vtFetch } from '../vtFetch';

export const innertubeFetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
  if (typeof init !== 'object') {
    init = {};
  }

  let url: string;

  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.href;
  } else {
    url = input.url;
  }

  const method = init?.method ?? (input instanceof Request ? input.method : undefined) ?? 'GET';

  return vtFetch.rawFetch(url, {
    ...(typeof input === 'string' ? {} : input),
    ...init,
    method,
    headers: init?.headers,
    body: init?.body,
    useProxy: true
  }) as  Promise<Response>;
};
