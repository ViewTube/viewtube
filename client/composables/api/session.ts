import type { ApiDto } from '@/utils/shared';

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
