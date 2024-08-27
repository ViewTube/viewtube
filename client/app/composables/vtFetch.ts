import { destr } from 'destr';
import { ofetch } from 'ofetch';
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

      return destr(response.body) as MappedType<R, T>;
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
