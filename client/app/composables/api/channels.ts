import type { ApiDto, ApiErrorDto } from '@viewtube/shared';

export const useGetChannelInfo = (id: Ref<string> | string) => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}`;
  });

  return useLazyAsyncData<ApiDto<'VTChannelPageDto'>, ApiErrorDto>(
    `channel-info-${unref(id)}`,
    () => vtFetch(url.value)
  );
};

export const useGetChannelHome = (id: Ref<string> | string) => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}/home`;
  });

  return useLazyAsyncData<ApiDto<'VTChannelHomeDto'>, ApiErrorDto>(
    `channel-home-${unref(id)}`,
    () => vtFetch(url.value)
  );
};

export const useGetChannelStats = (id: Ref<string> | string) => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}/stats`;
  });

  return useLazyAsyncData<ApiDto<'VTChannelAboutDto'>, ApiErrorDto>(
    `channel-stats-${unref(id)}`,
    () => vtFetch(url.value)
  );
};

type ChannelVideoOptions = {
  sortBy: Ref<ChannelVideosSortOptionsType>;
};

type ChannelVideosOptions = ChannelVideoOptions & {
  /** Youtube only offers this on channels with memberships; ViewTube defaults to public. */
  filter: Ref<ChannelVideosFilterOptionsType>;
};

export const useGetChannelVideos = (id: Ref<string> | string, options: ChannelVideosOptions) => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}/videos`;
  });

  return useLazyAsyncData<ApiDto<'VTChannelFeedDto'>, ApiErrorDto>(
    `channel-videos-${unref(id)}`,
    () =>
      vtFetch(url.value, {
        query: {
          sort: unref(options.sortBy) ?? 'newest',
          filter: unref(options.filter) ?? 'public'
        }
      }),
    { watch: [options.sortBy, options.filter] }
  );
};

export const useGetChannelShorts = (id: Ref<string> | string, options: ChannelVideoOptions) => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}/shorts`;
  });

  return useLazyAsyncData<ApiDto<'VTChannelFeedDto'>, ApiErrorDto>(
    `channel-shorts-${unref(id)}`,
    () =>
      vtFetch(url.value, {
        query: {
          sort: unref(options.sortBy) ?? 'newest'
        }
      }),
    { watch: [options.sortBy] }
  );
};

export const useGetChannelLivestreams = (
  id: Ref<string> | string,
  options: ChannelVideoOptions
) => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}/livestreams`;
  });

  return useLazyAsyncData<ApiDto<'VTChannelFeedDto'>, ApiErrorDto>(
    `channel-livestreams-${unref(id)}`,
    () =>
      vtFetch(url.value, {
        query: {
          sort: unref(options.sortBy) ?? 'newest'
        }
      }),
    { watch: [options.sortBy] }
  );
};

export const useGetChannelPlaylists = (id: Ref<string> | string) => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}/playlists`;
  });

  return useLazyAsyncData<ApiDto<'VTChannelPlaylistsDto'>, ApiErrorDto>(
    `channel-playlists-${unref(id)}`,
    () => vtFetch(url.value)
  );
};

export const useGetChannelCommunityPosts = (id: Ref<string> | string) => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}/communityposts`;
  });

  return useLazyAsyncData<ApiDto<'VTCommunityPostsDto'>, ApiErrorDto>(
    `channel-community-posts-${unref(id)}`,
    () => vtFetch(url.value)
  );
};
