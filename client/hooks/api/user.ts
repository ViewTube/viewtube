type UserHistoryParams = {
  limit: number;
  start: number;
  searchTerm: string;
};

export const useGetUserHistory = ({ searchTerm, limit, start }: UserHistoryParams) => {
  const config = useRuntimeConfig();

  let filterString = '';
  if (searchTerm.value) {
    filterString = `&filter=${searchTerm}`;
  }

  return useLazyFetch(() => {
    return $fetch(
      `${config.apiUrl}user/history?limit=${limit}&start=${start}${filterString}&sort=DESC`,
      { credentials: 'include' }
    );
  });
};

export const useGetUserHistoryItem = (videoId: string) => {
  const config = useRuntimeConfig();

  return useLazyFetch<{
    videoId: string;
    progressSeconds: number;
    lengthSeconds: number;
    lastVisit: Date;
  }>(() => {
    return $fetch(`${config.apiUrl}user/history/${videoId}`, {
      credentials: 'include'
    });
  });
};

export const useGetUserProfileDetails = (videoId: string) => {
  const config = useRuntimeConfig();

  return useLazyFetch(() => {
    return $fetch(`${config.apiUrl}user/profile/details`, {
      credentials: 'include'
    });
  });
};

export const useGetUserSubscriptions = ({ limit = 20, start = 0 }) => {
  const config = useRuntimeConfig();

  return useLazyFetch(() => {
    return $fetch(`${config.apiUrl}user/subscriptions/videos?limit=${limit}&start=${start}`, {
      credentials: 'include'
    });
  });
};

export const useGetUserSubscriptionChannels = ({ limit = 20, start = 0 }) => {
  const config = useRuntimeConfig();

  return useLazyFetch(() => {
    return $fetch(`${config.apiUrl}user/subscriptions/videos?limit=${limit}&start=${start}`, {
      credentials: 'include'
    });
  });
};
