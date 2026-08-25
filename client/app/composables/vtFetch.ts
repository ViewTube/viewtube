import { destr } from 'destr';
import { createFetchError, ofetch, type FetchContext } from 'ofetch';
import { withQuery } from 'ufo';

interface ResponseMap {
  blob: Blob;
  text: string;
  arrayBuffer: ArrayBuffer;
  stream: ReadableStream<Uint8Array>;
}
type ResponseType = keyof ResponseMap | 'json';
type MappedType<R extends ResponseType, JsonType = any> = R extends keyof ResponseMap
  ? ResponseMap[R]
  : JsonType;
type FetchRequest = Parameters<typeof ofetch>[0];
type FetchOptions = Parameters<typeof ofetch>[1] & { external?: boolean };

type HTTPMethods =
  | 'DELETE'
  | 'delete'
  | 'GET'
  | 'get'
  | 'HEAD'
  | 'head'
  | 'PATCH'
  | 'patch'
  | 'POST'
  | 'post'
  | 'PUT'
  | 'put'
  | 'OPTIONS'
  | 'options';

export const useVtFetch = () => {
  const refreshToken = useCookie('RefreshToken');
  const accessToken = useCookie('AccessToken');
  const settings = useCookie('settings');
  const nuxtApp = useNuxtApp();

  const vtFetch = async <T = any, R extends ResponseType = 'json'>(
    request: FetchRequest,
    options?: FetchOptions
  ): Promise<MappedType<R, T>> => {
    const requestOptions = { ...options };
    delete requestOptions.external;

    if (!requestOptions.credentials && !options?.external) requestOptions.credentials = 'include';

    if (import.meta.server && !options?.external) {
      const cookieHeader = Object.entries({
        RefreshToken: refreshToken.value,
        AccessToken: accessToken.value,
        settings: settings.value
      })
        .map(([key, value]) => {
          if (value) {
            return `${key}=${value}`;
          }
        })
        .filter(Boolean)
        .join('; ');

      requestOptions.headers = { ...requestOptions.headers, cookie: cookieHeader };
    }

    if (import.meta.server && !options?.external && global?.nestApp) {
      const requestUrl = withQuery(request.toString(), {
        ...(requestOptions.query ?? {}),
        ...(requestOptions.params ?? {})
      });

      const response = await global.nestApp.inject({
        method: (requestOptions.method ?? 'GET') as HTTPMethods,
        url: requestUrl,
        headers: requestOptions.headers as Record<string, string>,
        body: requestOptions.body,
        authority: 'nuxtApp'
      });

      const data = destr(response.body);

      // `inject` resolves for a 404 the same way it resolves for a 200, so without this an api
      // error body arrives as data: `useLazyAsyncData` reports no error and the page renders a
      // skeleton of something that does not exist. `ofetch.raw` throws on the browser path, so the
      // error has to carry the same fields there — `error.data.message` is what the pages read.
      if (response.statusCode >= 400) {
        throw createFetchError({
          request: requestUrl,
          options: requestOptions,
          response: {
            status: response.statusCode,
            statusText: response.statusMessage,
            _data: data
          }
        } as unknown as FetchContext);
      }

      return data as MappedType<R, T>;
    }

    const response = await ofetch.raw(request, requestOptions);

    if (import.meta.server && !options?.external) {
      const setCookies = response.headers.getSetCookie();
      if (setCookies) {
        setCookies.forEach(cookie => {
          nuxtApp.ssrContext.event.node.res.setHeader('set-cookie', cookie);
        });
      }
    }

    return response._data as MappedType<R, T>;
  };

  return { vtFetch };
};
