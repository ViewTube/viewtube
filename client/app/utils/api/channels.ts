import type { ApiDto } from '@viewtube/shared';

/** Shared by the videos, shorts and livestreams tabs — the token carries the sort and filter. */
export const getChannelVideosContinuation = (continuation: string) => {
  const { apiUrl } = useApiUrl();

  return vtClientFetch<ApiDto<'VTChannelFeedDto'>>(`${apiUrl.value}channels/videos/continuation`, {
    query: {
      continuation
    }
  });
};

export const getChannelPlaylistsContinuation = (continuation: string) => {
  const { apiUrl } = useApiUrl();

  return vtClientFetch<ApiDto<'VTChannelPlaylistsDto'>>(
    `${apiUrl.value}channels/playlists/continuation`,
    {
      query: {
        continuation
      }
    }
  );
};

export const getChannelCommunityPostsContinuation = (continuation: string) => {
  const { apiUrl } = useApiUrl();

  return vtClientFetch<ApiDto<'VTCommunityPostsDto'>>(
    `${apiUrl.value}channels/communityposts/continuation`,
    {
      query: {
        continuation
      }
    }
  );
};
