import undici, { Dispatcher, ProxyAgent, RequestInit } from 'undici';
import { socksDispatcher } from 'fetch-socks';
import { SocksProxy } from 'socks';
import { destr } from 'destr';

type VtFetchOptionsType = Omit<Dispatcher.RequestOptions, 'origin' | 'path' | 'method'> &
  Partial<Pick<Dispatcher.RequestOptions, 'method'>> & {
    useProxy?: boolean;
  };

type RequestOptionsType = { dispatcher?: Dispatcher } & Omit<
  Dispatcher.RequestOptions,
  'origin' | 'path'
>;

const getProxyUrl = () => {
  return process.env.VIEWTUBE_PROXY_URL;
};

export const vtFetch = async (url: string, options: VtFetchOptionsType = {}) => {
  const requestOptions: RequestOptionsType = {
    method: options?.method ?? 'GET'
  };

  if (options.useProxy) {
    const proxyUrl = getProxyUrl();
    const dispatcher = getDispatcher(proxyUrl);
    requestOptions.dispatcher = dispatcher;
  }

  const response = await undici.request(url, requestOptions);

  response.body.json = async () => {
    const data = await response.body.text();
    return destr(data);
  };
};

const getDispatcher = (proxyUrl: string) => {
  if (proxyUrl.match(/^https?:\/\//)) {
    return new ProxyAgent(proxyUrl);
  } else if (proxyUrl.startsWith('https://')) {
    return new ProxyAgent(proxyUrl);
  } else if (proxyUrl.startsWith('socks')) {
    const socksProxy = parseSocksURL(proxyUrl);
    return socksDispatcher(socksProxy);
  }
};

function parseSocksURL(url: string): SocksProxy {
  const socksUrl = new URL(url);
  let type: SocksProxy['type'] = 5;
  const host = socksUrl.hostname;

  const port = parseInt(socksUrl.port, 10) || 1080;

  switch (socksUrl.protocol.replace(':', '')) {
    case 'socks4':
    case 'socks4a':
      type = 4;
      break;
    case 'socks5':
    case 'socks':
    case 'socks5h':
      type = 5;
      break;
    default:
      type = 5;
      break;
  }

  const proxy: SocksProxy = {
    host,
    port,
    type
  };

  if (socksUrl.username) {
    Object.defineProperty(proxy, 'userId', {
      value: decodeURIComponent(socksUrl.username),
      enumerable: false
    });
  }

  if (socksUrl.password != null) {
    Object.defineProperty(proxy, 'password', {
      value: decodeURIComponent(socksUrl.password),
      enumerable: false
    });
  }

  return proxy;
}
