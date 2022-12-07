import { ApiDto, ApiErrorDto } from 'viewtube/shared';
import { Ref } from 'vue';

export const useGetChannelInfo = (id: Ref<string> | string) => {
  const { apiUrl } = useApiUrl();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl}channels/${channelId}`;
  });

  return useLazyFetch<ApiDto<'ChannelInfoDto'>, ApiErrorDto>(url);
};

export const useGetChannelHome = (id: Ref<string> | string) => {
  const { apiUrl } = useApiUrl();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl}channels/${channelId}/home`;
  });

  return useLazyFetch<ApiDto<'ChannelHomeDto'>, ApiErrorDto>(url);
};

export const useGetChannelStats = (id: Ref<string> | string) => {
  const { apiUrl } = useApiUrl();

  const url = computed(() => {
    const channelId = unref(id);
    return `${apiUrl}channels/${channelId}/stats`;
  });

  return useLazyFetch<ApiDto<'ChannelStatsDto'>, ApiErrorDto>(url);
};
