import { ApiDto } from 'viewtube/shared';

type PlaylistType = Omit<ApiDto<'PlaylistResultDto'>, 'visibility'> & {
  visibility: 'unlisted' | 'everyone';
};

export const useGetPlaylists = (id: string, { pages = 1 }) => {
  const { apiUrl } = useApiUrl();

  return useLazyFetch<PlaylistType>(`${apiUrl}playlists/${id}?pages=${pages}`);
};
