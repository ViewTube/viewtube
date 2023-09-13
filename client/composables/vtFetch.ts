import { ofetch } from 'ofetch';

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
type FetchOptions = Parameters<typeof ofetch>[1];

export const useVtFetch = () => {
  const refreshToken = useCookie('RefreshToken');
  const accessToken = useCookie('AccessToken');
  const settings = useCookie('settings');
  const nuxtApp = useNuxtApp();

  const vtFetch = async <T = any, R extends ResponseType = 'json'>(
    request: FetchRequest,
    options?: FetchOptions
  ): Promise<MappedType<R, T>> => {
    const requestOptions = options ?? {};

    if (!requestOptions.credentials) requestOptions.credentials = 'include';

    if (process.server) {
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

    const response = await ofetch.raw(request, requestOptions);
    const setCookies = response.headers.getSetCookie();
    if (setCookies) {
      setCookies.forEach(cookie => {
        nuxtApp.ssrContext.event.node.res.setHeader('set-cookie', cookie);
      });
    }

    return response._data as Promise<MappedType<R, T>>;
  };

  return { vtFetch };
};
