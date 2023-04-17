import HttpsProxyAgent from 'https-proxy-agent';
import HttpsProxyAgentType from 'https-proxy-agent/dist/agent';
import { fetch } from 'ofetch';
import { RequestInfo, RequestInit } from 'undici';

export const innertubeFetch = async (
  input: RequestInfo | string,
  init?: RequestInit & { agent: HttpsProxyAgentType }
) => {
  if (process.env.VIEWTUBE_PROXY_URL) {
    const proxy = process.env.VIEWTUBE_PROXY_URL;
    const proxyAgent = HttpsProxyAgent(proxy);
    init.agent = proxyAgent;
  }

  const url =
    typeof input === 'string' ? new URL(input) : input instanceof URL ? input : new URL(input.url);

  const headers = init?.headers
    ? new Headers(init.headers)
    : input instanceof Request
    ? (input as any).headers
    : new Headers();

  const request = new Request(url);

  console.log('innertubeFetch', request.method, request.url, request.body)

  return fetch(request, {
    ...init,
    headers
  });
};
