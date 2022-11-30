import { ApiDto } from 'viewtube/shared';

export const useGetPlaylists = (id: string, { pages = 1 }) => {
  const { apiUrl } = useApiUrl();

  return useLazyFetch<ApiDto<'PlaylistResultDto'>>(
    `${apiUrl}playlists/${id}?pages=${pages}`
  );
};
