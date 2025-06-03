import { Request, RequestInit } from 'undici';
import { vtFetch } from '../vtFetch';

export const innertubeFetch = async (
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> => {
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

  let method = 'GET';

  if (init?.method) {
    method = init.method.toUpperCase();
  } else if (input instanceof Request) {
    method = input.method.toUpperCase();
  } else if (init?.body) {
    method = 'POST';
  }

  return vtFetch.rawFetch(url, {
    ...(typeof input === 'string' ? {} : input),
    ...init,
    method,
    headers: init?.headers,
    body: init?.body,
    useProxy: true
  }) as Promise<Response>;
};
