import type { ApiDto } from '@viewtube/shared';

export const getDislikes = (id: string | string[]) => {
  const { apiUrl } = useApiUrl();

  return vtClientFetch<ApiDto<'DislikeDto'>>(`${apiUrl.value}videos/${id}/dislikes`);
};

/**
 * Re-fetches a video's playback data. Used when YouTube asks the SABR session to reload —
 * the server re-issues the streaming URL and ustreamer config, which expire on their own
 * clock (roughly six hours) independently of the page.
 */
export const getVideoInfo = (id: string) => {
  const { apiUrl } = useApiUrl();

  return vtClientFetch<ApiDto<'VTVideoInfoDto'>>(`${apiUrl.value}videos/${id}`);
};
