export const getChannelVideosContinuation = (continuation: string) => {
  const { apiUrl } = useApiUrl();

  return vtClientFetch<ApiDto<'ChannelVideosContinuationDto'>>(
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

  return vtClientFetch<ApiDto<'ChannelPlaylistsContinuationDto'>>(
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

  return vtClientFetch<ApiDto<'RelatedChannelsContinuationDto'>>(
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

  return vtClientFetch<ApiDto<'ChannelCommunityPostsContinuationDto'>>(
    `${apiUrl.value}channels/communityposts/continuation`,
    {
      query: {
        continuation,
        innertube: innertubeKey
      }
    }
  );
};
