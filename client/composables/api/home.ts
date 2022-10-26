import { ApiDto } from 'viewtube/shared';

export const useGetPopularPage = () => {
  const config = useRuntimeConfig();

  return useLazyFetch<{ videos: ApiDto<'VideoDto'>[] }>(`${config.public.apiUrl}homepage/popular`);
};
