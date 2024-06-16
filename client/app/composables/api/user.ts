import type { ApiDto } from '@viewtube/shared';

type UserHistoryParams = {
  limit: number;
  start: number;
  searchTerm: string;
};

export const useGetUserHistory = ({ searchTerm, limit, start }: UserHistoryParams) => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  let filterString = '';
  if (searchTerm) {
    filterString = `&filter=${searchTerm}`;
  }

  const urlPart = `user/history?limit=${limit}&start=${start}${filterString}&sort=DESC`;

  return useLazyAsyncData<ApiDto<'HistoryResponseDto'>>(urlPart, () =>
    vtFetch(`${apiUrl.value}${urlPart}`)
  );
};

export const useGetUserHistoryItem = (videoId: string) => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const urlPart = `user/history/${videoId}`;

  return useLazyAsyncData<{
    videoId: string;
    progressSeconds: number;
    lengthSeconds: number;
    lastVisit: Date;
  }>(urlPart, () => vtFetch(`${apiUrl.value}${urlPart}`));
};

export const useGetUserProfileDetails = () => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const urlPart = `user/profile/details`;

  return useLazyAsyncData<ApiDto<'UserprofileDetailsDto'>>(urlPart, () =>
    vtFetch(`${apiUrl.value}${urlPart}`)
  );
};

type UserSubscriptionsParams = {
  limit?: number | Ref<number>;
  currentPage?: number | Ref<number>;
};

export const useGetUserSubscriptions = (
  config: UserSubscriptionsParams = { limit: 20, currentPage: 1 }
) => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const url = computed(() => {
    const limit = unref(config.limit ?? 20);
    const start = (unref(config.currentPage ?? 1) - 1) * limit;
    return `${apiUrl.value}user/subscriptions/videos?limit=${limit}&start=${start}`;
  });

  return useLazyAsyncData<ApiDto<'SubscriptionFeedResponseDto'>>('user/subscriptions/videos', () =>
    vtFetch(url.value)
  );
};

type UserSubscriptionChannelsParams = {
  limit?: number | Ref<number>;
  currentPage?: number | Ref<number>;
  searchTerm?: Ref<string> | string;
};

export const useGetUserSubscriptionChannels = (
  config: UserSubscriptionChannelsParams = { limit: 20, currentPage: 1, searchTerm: '' }
) => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const url = computed(() => {
    let filterString = '';
    const searchTerm = unref(config.searchTerm);
    if (searchTerm) {
      filterString = `&filter=${searchTerm}`;
    }

    const limit = unref(config.limit ?? 20);
    const start = (unref(config.currentPage ?? 1) - 1) * limit;
    return `${apiUrl.value}user/subscriptions/channels?limit=${limit}&start=${start}&sort=author:1${filterString}`;
  });

  return useLazyAsyncData<ApiDto<'SubscribedChannelsResponseDto'>>(
    'user/subscriptions/channels',
    () => vtFetch(url.value)
  );
};
