import { ApiDto } from 'viewtube/shared';

export const useGetPlaylists = (id: string, { pages = 1 }) => {
  const config = useRuntimeConfig();

  return useLazyFetch<ApiDto<'PlaylistResultDto'>>(
    `${config.public.apiUrl}playlists/${id}?pages=${pages}`
  );
};
