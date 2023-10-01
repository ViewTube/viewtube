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

  return useLazyAsyncData('admin-info', () => vtFetch(`${apiUrl.value}admin/info`), {
    server: false
  });
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

export const useCreateUser = () => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const createUser = async (data: { username: string; password: string }) => {
    return vtFetch<ApiDto<'UserprofileDto'>>(`${apiUrl.value}admin/users`, {
      method: 'POST',
      body: data
    });
  };
  return { createUser };
};
