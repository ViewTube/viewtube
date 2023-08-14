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
  const { rateLimitKey } = useRuntimeConfig();
  const vtFetch = <T = any, R extends ResponseType = 'json'>(
    request: FetchRequest,
    options?: FetchOptions
  ): Promise<MappedType<R, T>> => {
    const userAgentOption = {};

    if (rateLimitKey?.length > 0) {
      userAgentOption['user-agent'] = `viewtube-nuxt-${rateLimitKey}`;
    }

    return ofetch(request, {
      ...options,
      headers: {
        ...options?.headers,
        ...userAgentOption
      }
    }) as any;
  };

  return { vtFetch };
};
