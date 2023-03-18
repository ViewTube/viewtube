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

  return useLazyAsyncData<string[]>(
    'blocked-videos',
    () => $fetch(`${apiUrl.value}admin/blocked-videos`),
    {
      server: false
    }
  );
};
