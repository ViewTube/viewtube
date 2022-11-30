import { ApiDto } from 'viewtube/shared';
import { useAuthorizationHeader } from '../authorizationHeader';

type UserHistoryParams = {
  limit: number;
  start: number;
  searchTerm: string;
};

export const useGetUserHistory = ({ searchTerm, limit, start }: UserHistoryParams) => {
  const { apiUrl } = useApiUrl();
  const authorizationHeader = useAuthorizationHeader();

  let filterString = '';
  if (searchTerm) {
    filterString = `&filter=${searchTerm}`;
  }

  const url = `${apiUrl}user/history?limit=${limit}&start=${start}${filterString}&sort=DESC`;

  return useLazyFetch<ApiDto<'HistoryResponseDto'>>(url, {
    headers: {
      Authorization: authorizationHeader
    },
    credentials: 'include'
  });
};

export const useGetUserHistoryItem = (videoId: string) => {
  const { apiUrl } = useApiUrl();
  const authorizationHeader = useAuthorizationHeader();

  const url = `${apiUrl}user/history/${videoId}`;

  return useLazyFetch<{
    videoId: string;
    progressSeconds: number;
    lengthSeconds: number;
    lastVisit: Date;
  }>(url, {
    headers: {
      Authorization: authorizationHeader
    },
    credentials: 'include'
  });
};

export const useGetUserProfileDetails = () => {
  const { apiUrl } = useApiUrl();
  const authorizationHeader = useAuthorizationHeader();

  const url = `${apiUrl}user/profile/details`;

  return useLazyFetch<ApiDto<'UserprofileDetailsDto'>>(url, {
    headers: {
      Authorization: authorizationHeader
    },
    credentials: 'include'
  });
};

export const useGetUserSubscriptions = ({ limit = 20, start = 0 } = { limit: 20, start: 0 }) => {
  const { apiUrl } = useApiUrl();
  const authorizationHeader = useAuthorizationHeader();

  const url = `${apiUrl}user/subscriptions/videos?limit=${limit}&start=${start}`;

  return useLazyFetch<ApiDto<'SubscriptionFeedResponseDto'>>(url, {
    headers: {
      Authorization: authorizationHeader
    },
    credentials: 'include'
  });
};

export const useGetUserSubscriptionChannels = (
  { limit = 30, start = 0, searchTerm = undefined } = { limit: 30, start: 0, searchTerm: undefined }
) => {
  const { apiUrl } = useApiUrl();
  const authorizationHeader = useAuthorizationHeader();

  let filterString = '';
  if (searchTerm) {
    filterString = `&filter=${searchTerm}`;
  }

  const url = `${apiUrl}user/subscriptions/channels?limit=${limit}&start=${start}&sort=author:1${filterString}`;

  return useLazyFetch<ApiDto<'SubscribedChannelsResponseDto'>>(url, {
    headers: {
      Authorization: authorizationHeader
    },
    credentials: 'include'
  });
};
