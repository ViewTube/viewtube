import { ApiDto } from 'viewtube/shared';

export const useGetPopularPage = () => {
  const { apiUrl } = useApiUrl();

  return useLazyFetch<{ videos: ApiDto<'VideoDto'>[] }>(`${apiUrl}homepage/popular`);
};
