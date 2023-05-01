import { ApiDto } from 'viewtube/shared';

export const useGetLogs = () => {
  const { apiUrl } = useApiUrl();

  return useLazyAsyncData<ApiDto<'LogsDto'>>(
    'logfiles-list',
    () => $fetch(`${apiUrl.value}admin/logs`),
    {
      server: false
    }
  );
};

export const useGetBlockedVideos = () => {
  const { apiUrl } = useApiUrl();

  return useLazyAsyncData(
    'blocked-videos',
    () => $fetch<string[]>(`${apiUrl.value}admin/blocked-videos`),
    {
      server: false
    }
  );
};
