import { VideoDto } from 'viewtube/shared';

export const useGetPopularPage = () => {
  const config = useRuntimeConfig();

  return useLazyFetch<{ videos: VideoDto[] }>(`${config.public.apiUrl}homepage/popular`);
};
