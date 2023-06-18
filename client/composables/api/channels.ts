import { ApiDto, ApiErrorDto } from 'viewtube/shared';
import { Ref } from 'vue';
import { ChannelVideosSortOptionsType } from '@/utils/sortOptions';

export const useGetChannelInfo = (id: Ref<string> | string) => {
  const { apiUrl } = useApiUrl();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}`;
  });

  return useLazyAsyncData<ApiDto<'ChannelInfoDto'>, ApiErrorDto>(`channel-info-${unref(id)}`, () =>
    vtFetch(url.value)
  );
};

export const useGetChannelHome = (id: Ref<string> | string) => {
  const { apiUrl } = useApiUrl();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}/home`;
  });

  return useLazyAsyncData<ApiDto<'ChannelHomeDto'>, ApiErrorDto>(`channel-home-${unref(id)}`, () =>
    vtFetch(url.value)
  );
};

export const useGetChannelStats = (id: Ref<string> | string) => {
  const { apiUrl } = useApiUrl();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}/stats`;
  });

  return useLazyAsyncData<ApiDto<'ChannelStatsDto'>, ApiErrorDto>(
    `channel-stats-${unref(id)}`,
    () => vtFetch(url.value)
  );
};

type ChannelVideoOptions = {
  sortBy: Ref<ChannelVideosSortOptionsType>;
};

export const useGetChannelVideos = (id: Ref<string> | string, options: ChannelVideoOptions) => {
  const { apiUrl } = useApiUrl();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}/videos`;
  });

  return useLazyAsyncData<ApiDto<'ChannelVideosDto'>, ApiErrorDto>(
    `channel-videos-${unref(id)}`,
    () => vtFetch(`${url.value}?sort=${unref(options.sortBy ?? 'newest')}`),
    { watch: [options.sortBy] }
  );
};

export const useGetChannelShorts = (id: Ref<string> | string, options: ChannelVideoOptions) => {
  const { apiUrl } = useApiUrl();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}/shorts`;
  });

  return useLazyAsyncData<ApiDto<'ChannelVideosDto'>, ApiErrorDto>(
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

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}/livestreams`;
  });

  return useLazyAsyncData<ApiDto<'ChannelVideosDto'>, ApiErrorDto>(
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

type ChannelPlaylistOptions = {
  sortBy: Ref<'last' | 'newest' | 'oldest'>;
};

export const useGetChannelPlaylists = (
  id: Ref<string> | string,
  options: ChannelPlaylistOptions
) => {
  const { apiUrl } = useApiUrl();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}/playlists`;
  });

  return useLazyAsyncData<ApiDto<'ChannelPlaylistsDto'>, ApiErrorDto>(
    `channel-playlists-${unref(id)}`,
    () =>
      vtFetch(url.value, {
        query: {
          sort: unref(options.sortBy) ?? 'last'
        }
      }),
    { watch: [options.sortBy] }
  );
};

export const useGetChannelCommunityPosts = (id: Ref<string> | string) => {
  const { apiUrl } = useApiUrl();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}/communityposts`;
  });

  return useLazyAsyncData<ApiDto<'ChannelCommunityPostsDto'>, ApiErrorDto>(
    `channel-community-posts-${unref(id)}`,
    () => vtFetch(url.value)
  );
};
