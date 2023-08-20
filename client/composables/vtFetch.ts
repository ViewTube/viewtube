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
  const vtFetch = <T = any, R extends ResponseType = 'json'>(
    request: FetchRequest,
    options?: FetchOptions
  ): Promise<MappedType<R, T>> => {
    return ofetch(request, options) as Promise<MappedType<R, T>>;
  };

  return { vtFetch };
};
