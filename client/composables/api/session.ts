import type { ApiDto } from '@viewtube/shared';

export const useGetSessions = () => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const urlPart = `user/sessions`;

  return useLazyAsyncData(urlPart, () =>
    vtFetch<Array<ApiDto<'SessionDto'>>>(`${apiUrl.value}${urlPart}`)
  );
};

export const useGetCurrentSession = () => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const urlPart = `user/sessions/current`;

  return useLazyAsyncData<ApiDto<'SessionDto'>>(urlPart, () =>
    vtFetch(`${apiUrl.value}${urlPart}`)
  );
};

export const useEditSession = () => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const urlPart = `user/sessions`;

  const editSession = async (id: string, data: { deviceName: string; deviceType: string }) => {
    return vtFetch<ApiDto<'SessionDto'>>(`${apiUrl.value}${urlPart}/${id}`, {
      method: 'PUT',
      body: data
    });
  };

  return {
    editSession
  };
};

export const useRemoveSession = () => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const urlPart = `user/sessions`;

  const removeSession = async (id: string) => {
    return vtFetch(`${apiUrl.value}${urlPart}/${id}`, {
      method: 'DELETE'
    });
  };

  return {
    removeSession
  };
};
