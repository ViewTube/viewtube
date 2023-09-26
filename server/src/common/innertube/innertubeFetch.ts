import { HttpsProxyAgent } from 'https-proxy-agent';
import { fetch } from 'ofetch';
import { Request, RequestInit } from 'undici';
import { getProxyAgent, proxyEnabled } from '../proxyAgent';
import { HttpProxyAgent } from 'http-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

type InputType = Request & {
  method?: string;
};

type InitType = RequestInit & {
  agent?: HttpsProxyAgent<string> | HttpProxyAgent<string> | SocksProxyAgent;
};

export const innertubeFetch = async (
  input: InputType,
  init?: InitType
) => {
  if (!init) {
    init = {};
  }

  if (proxyEnabled()) {
    init.agent = getProxyAgent();
  }

  let url: string;

  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.href;
  } else {
    url = input.url;
  }

  return fetch(url, {
    method: init?.method ?? input?.method ?? 'GET',
    headers: init?.headers,
    body: init?.body,
    ...(typeof input === 'string' ? {} : input),
    ...init
  });
};
