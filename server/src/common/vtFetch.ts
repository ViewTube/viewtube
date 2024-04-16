import undici, {
  type BodyMixin,
  type Dispatcher,
  Headers,
  type HeadersInit,
  ProxyAgent,
  type RequestInfo,
  type RequestInit,
  type Response
} from 'undici';
import { socksDispatcher } from 'fetch-socks';
import { SocksProxy } from 'socks';
import { destr } from 'destr';
import { UrlObject } from 'url';
import { getProxyUrl, proxyEnabled } from './proxyAgent';
import BodyReadable from 'undici/types/readable';

type VtFetchOptionsType = Omit<RequestOptionsType, 'dispatcher' | 'method' | 'headers'> & {
  useProxy?: boolean;
  method?: string;
  headers?: Record<string, string> | HeadersInit;
};

type RequestOptionsType = {
  dispatcher?: Dispatcher;
  signal?: AbortSignal;
} & Omit<Dispatcher.RequestOptions, 'origin' | 'path' | 'method' | 'signal'> &
  Partial<Pick<Dispatcher.RequestOptions, 'method'>>;

type VtFetchRawOptionsType = RequestInit & {
  useProxy?: boolean;
};

type JsonFnType<T> = () => Promise<T>;
type ResponseBodyBaseType = BodyReadable & BodyMixin;
type ResponseBodyType<T> = Omit<ResponseBodyBaseType, 'json'> & { json: JsonFnType<T> };
type ResponseType<T> = Omit<Dispatcher.ResponseData, 'body'> & {
  body: ResponseBodyType<T>;
};

const vtFetch = async <T = any>(
  url: string | URL | UrlObject,
  options: VtFetchOptionsType = {}
): Promise<ResponseType<T>> => {
  if (!options) options = {};

  const { headers: rawHeaders, ...rawOptions } = options;

  const requestOptions: RequestOptionsType = {
    ...rawOptions,
    method: (options?.method as Dispatcher.HttpMethod) ?? 'GET'
  };

  if (options.useProxy && proxyEnabled()) {
    const proxyUrl = getProxyUrl();
    const dispatcher = getDispatcher(proxyUrl);
    requestOptions.dispatcher = dispatcher;
  }

  if (rawHeaders) {
    if (rawHeaders instanceof Headers) {
      const headers: Record<string, string> = {};
      for (const [key, value] of rawHeaders.entries()) {
        headers[key] = value;
      }
      requestOptions.headers = headers;
    } else {
      requestOptions.headers = rawHeaders as Record<string, string>;
    }
  }

  const response = (await undici.request(url, requestOptions)) as ResponseType<T>;

  const destrJson = async (): Promise<T> => {
    const data = await response.body.text();
    return destr(data);
  };

  response.body.json = destrJson;

  return response;
};

const vtFetchRaw = async (url: RequestInfo, options?: VtFetchRawOptionsType): Promise<Response> => {
  if (!options) options = {};
  const requestOptions = {
    ...options,
    method: options?.method ?? 'GET'
  };

  if (options.useProxy && proxyEnabled()) {
    const proxyUrl = getProxyUrl();
    const dispatcher = getDispatcher(proxyUrl);
    requestOptions.dispatcher = dispatcher;
  }

  const response = await undici.fetch(url, options);
  return response;
};

vtFetch.rawFetch = vtFetchRaw;

export { vtFetch };

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
