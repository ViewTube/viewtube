import { Innertube, InnertubeConfig, UniversalCache } from 'youtubei.js';
import path from 'path';
import { RequestInfo, RequestInit } from 'undici';
import { ofetch, fetch } from 'ofetch';
import HttpsProxyAgent from 'https-proxy-agent';
import HttpsProxyAgentType from 'https-proxy-agent/dist/agent';

let cacheDirectory = './cache';
if (process.env.VIEWTUBE_DATA_DIRECTORY) {
  cacheDirectory = path.join(process.env.VIEWTUBE_DATA_DIRECTORY, 'cache');
}

const innertubeOptions: InnertubeConfig = {
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
    return fetch(input, init);
  }
};

if (process.env.VIEWTUBE_YOUTUBE_COOKIE) {
  innertubeOptions.cookie = process.env.VIEWTUBE_YOUTUBE_COOKIE;
}

export const innertubeClient = Innertube.create(innertubeOptions);
