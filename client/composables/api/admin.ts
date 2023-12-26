import type { ApiDto } from '@/utils/shared';

export const useGetLogs = () => {
  const { apiUrl } = useApiUrl();

  return useLazyAsyncData<ApiDto<'LogsDto'>>(
    'logfiles-list',
    () => fetch(`${apiUrl.value}admin/logs`).then(res => res.json()),
    {
      server: false
    }
  );
};

export const useGetAdminInfo = () => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  return useLazyAsyncData<ApiDto<'InfoDto'>>(
    'admin-info',
    () => vtFetch(`${apiUrl.value}admin/info`),
    {
      server: false
    }
  );
};

export const useGetBlockedVideos = () => {
  const { apiUrl } = useApiUrl();

  return useLazyAsyncData<string[]>(
    'blocked-videos',
    () => fetch(`${apiUrl.value}admin/blocked-videos`).then(res => res.json()),
    {
      server: false
    }
  );
};
