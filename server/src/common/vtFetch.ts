import { destr } from 'destr';
import undici, {
  Headers,
  type BodyMixin,
  type Dispatcher,
  type HeadersInit,
  type RequestInfo,
  type RequestInit,
  type Response
} from 'undici';
import BodyReadable from 'undici/types/readable';
import { UrlObject } from 'url';
import { getDispatcher, getProxyUrl, proxyEnabled } from './proxyAgent';

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

  let close = () => {};

  if (options.useProxy && proxyEnabled()) {
    const proxyUrl = getProxyUrl();
    const { proxyAgent, done } = getDispatcher(proxyUrl);
    close = done;
    requestOptions.dispatcher = proxyAgent;
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

  close();

  return response;
};

const vtFetchRaw = async (url: RequestInfo, options?: VtFetchRawOptionsType): Promise<Response> => {
  if (!options) options = {};
  const requestOptions = {
    ...options,
    method: options?.method ?? 'GET'
  };

  let close = () => {};

  if (requestOptions.useProxy && proxyEnabled()) {
    const proxyUrl = getProxyUrl();
    const { proxyAgent, done } = getDispatcher(proxyUrl);
    close = done;
    requestOptions.dispatcher = proxyAgent;
  }

  const response = await undici.fetch(url, requestOptions);

  close();

  return response;
};

vtFetch.rawFetch = vtFetchRaw;

export { vtFetch };
