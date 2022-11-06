import { ApiDto } from 'viewtube/shared';
import { useAuthorizationHeader } from '../authorizationHeader';

type UserHistoryParams = {
  limit: number;
  start: number;
  searchTerm: string;
};

export const useGetUserHistory = ({ searchTerm, limit, start }: UserHistoryParams) => {
  const config = useRuntimeConfig();

  let filterString = '';
  if (searchTerm) {
    filterString = `&filter=${searchTerm}`;
  }

  const url = `${config.public.apiUrl}user/history?limit=${limit}&start=${start}${filterString}&sort=DESC`;

  return useLazyFetch(url, { credentials: 'include' });
};

export const useGetUserHistoryItem = (videoId: string) => {
  const config = useRuntimeConfig();

  const url = `${config.public.apiUrl}user/history/${videoId}`;

  return useLazyFetch<{
    videoId: string;
    progressSeconds: number;
    lengthSeconds: number;
    lastVisit: Date;
  }>(url, { credentials: 'include' });
};

export const useGetUserProfileDetails = () => {
  const config = useRuntimeConfig();
  const authorizationHeader = useAuthorizationHeader();

  const url = `${config.public.apiUrl}user/profile/details`;

  return useLazyFetch<ApiDto<'UserprofileDetailsDto'>>(url, {
    headers: {
      Authorization: authorizationHeader
    },
    credentials: 'include'
  });
};

export const useGetUserSubscriptions = ({ limit = 20, start = 0 }) => {
  const config = useRuntimeConfig();

  const url = `${config.public.apiUrl}user/subscriptions/videos?limit=${limit}&start=${start}`;

  return useLazyFetch<any[]>(url, { credentials: 'include' });
};

export const useGetUserSubscriptionChannels = ({ limit = 20, start = 0 }) => {
  const config = useRuntimeConfig();

  const url = `${config.public.apiUrl}user/subscriptions/videos?limit=${limit}&start=${start}`;

  return useLazyFetch(url, { credentials: 'include' });
};
