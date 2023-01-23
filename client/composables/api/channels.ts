import { ApiDto, ApiErrorDto } from 'viewtube/shared';
import { Ref } from 'vue';
import { SortOptionsType } from '@/utils/sortOptions';

export const useGetChannelInfo = (id: Ref<string> | string) => {
  const { apiUrl } = useApiUrl();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}`;
  });

  return useLazyAsyncData<ApiDto<'ChannelInfoDto'>, ApiErrorDto>(`channel-info-${unref(id)}`, () =>
    $fetch(url.value)
  );
};

export const useGetChannelHome = (id: Ref<string> | string) => {
  const { apiUrl } = useApiUrl();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}/home`;
  });

  return useLazyAsyncData<ApiDto<'ChannelHomeDto'>, ApiErrorDto>(`channel-home-${unref(id)}`, () =>
    $fetch(url.value)
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
    () => $fetch(url.value)
  );
};

export type ChannelVideoOptions = {
  sortBy: Ref<SortOptionsType>;
};

export const useGetChannelVideos = (id: Ref<string> | string, options: ChannelVideoOptions) => {
  const { apiUrl } = useApiUrl();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl.value}channels/${channelId}/videos`;
  });

  return useLazyAsyncData<ApiDto<'ChannelVideosDto'>, ApiErrorDto>(
    `channel-videos-${unref(id)}`,
    () =>
      $fetch(url.value, {
        query: {
          sort: unref(options.sortBy) ?? 'newest'
        }
      })
  );
};
