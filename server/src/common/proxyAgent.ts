import { HttpProxyAgent } from 'http-proxy-agent'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { SocksProxyAgent } from 'socks-proxy-agent'

export const getProxyUrl = () => {
  return process.env.VIEWTUBE_PROXY_URL;
}

export const proxyEnabled = () => {
  return getProxyUrl() !== undefined;
}

export const getProxyAgent = () => {
  if (proxyEnabled()) {
    const proxyUrl = getProxyUrl();

    if (proxyUrl.startsWith('http://')) {
      return new HttpProxyAgent(proxyUrl);
    } else if (proxyUrl.startsWith('https://')) {
      return new HttpsProxyAgent(proxyUrl);
    } else if (proxyUrl.startsWith('socks://')) {
      return new SocksProxyAgent(proxyUrl);
    }
  }
  return undefined;
}