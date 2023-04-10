import { Innertube, UniversalCache } from 'youtubei.js';
import path from 'path';
import { RequestInfo, RequestInit } from 'undici';
import { ofetch } from 'ofetch';
import HttpsProxyAgent from 'https-proxy-agent';
import HttpsProxyAgentType from 'https-proxy-agent/dist/agent';

let cacheDirectory = './cache';
if (process.env.VIEWTUBE_DATA_DIRECTORY) {
  cacheDirectory = path.join(process.env.VIEWTUBE_DATA_DIRECTORY, 'cache');
}

export const innertubeClient = Innertube.create({
  cache: new UniversalCache(true, cacheDirectory),
  fetch: async (
    input: RequestInfo | string,
    init?: RequestInit & { agent: HttpsProxyAgentType }
  ) => {
    if (process.env.VIEWTUBE_PROXY_URL) {
      const proxy = process.env.VIEWTUBE_PROXY_URL;
      const proxyAgent = HttpsProxyAgent(proxy);
      init.agent = proxyAgent;
    }
    return ofetch(input, init);
  },
  cookie: process.env.VIEWTUBE_YOUTUBE_COOKIE
});
