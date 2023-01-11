import { ApiDto } from 'viewtube/shared';

export const useGetPopularPage = () => {
  const { apiUrl } = useApiUrl();

  const urlPart = 'homepage/popular';

  return useLazyAsyncData<{ videos: ApiDto<'VideoDto'>[] }>(urlPart, () =>
    $fetch(`${apiUrl.value}${urlPart}`)
  );
};
