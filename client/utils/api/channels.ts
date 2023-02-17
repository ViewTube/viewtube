import { ApiDto } from 'viewtube/shared';

export const getChannelVideosContinuation = (continuation: string) => {
  const { apiUrl } = useApiUrl();

  return $fetch<ApiDto<'ChannelVideosContinuationDto'>>(
    `${apiUrl.value}channels/videos/continuation`,
    {
      query: {
        continuation
      }
    }
  );
};

export const getChannelPlaylistsContinuation = (continuation: string) => {
  const { apiUrl } = useApiUrl();

  return $fetch<ApiDto<'ChannelPlaylistsContinuationDto'>>(
    `${apiUrl.value}channels/playlists/continuation`,
    {
      query: {
        continuation
      }
    }
  );
};

export const getRelatedChannelsContinuation = (continuation: string) => {
  const { apiUrl } = useApiUrl();

  return $fetch<ApiDto<'RelatedChannelsContinuationDto'>>(
    `${apiUrl.value}channels/relatedchannels/continuation`,
    {
      query: {
        continuation
      }
    }
  );
};

export const getChannelCommunityPostsContinuation = (
  continuation: string,
  innertubeKey: string
) => {
  const { apiUrl } = useApiUrl();

  return $fetch<ApiDto<'ChannelCommunityPostsContinuationDto'>>(
    `${apiUrl.value}channels/communityposts/continuation`,
    {
      query: {
        continuation,
        innertube: innertubeKey
      }
    }
  );
};
