import { VideoDto } from 'viewtube/shared';

export const useGetVideos = (id: string) => {
  const config = useRuntimeConfig();

  return useLazyFetch<VideoDto>(`${config.public.apiUrl}videos/${id}`);
};
