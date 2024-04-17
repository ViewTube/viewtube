import type { ReferrerPolicy, Request, RequestInit } from 'undici';
import { vtFetch } from '../vtFetch';

type InputType = Request & {
  method?: string;
  referrerPolicy?: ReferrerPolicy;
};

export const innertubeFetch = async (input: InputType, init?: RequestInit) => {
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

  return vtFetch.rawFetch(url, {
    ...(typeof input === 'string' ? {} : input),
    ...init,
    method: init?.method ?? input?.method ?? 'GET',
    headers: init?.headers,
    body: init?.body,
    useProxy: true
  });
};
