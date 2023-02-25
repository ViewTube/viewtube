import { ApiDto } from 'viewtube/shared';

export const useGetPopularPage = () => {
  const { apiUrl } = useApiUrl();

  const urlPart = 'homepage/popular';

  return useLazyAsyncData<ApiDto<'PopularDto'>>(urlPart, () => $fetch(`${apiUrl.value}${urlPart}`));
};

export const useGetHomeFeed = () => {
  const { apiUrl } = useApiUrl();

  const urlPart = 'homepage/homefeed';

  return useLazyAsyncData<ApiDto<'HomeFeedDto'>>(urlPart, () =>
    $fetch(`${apiUrl.value}${urlPart}`)
  );
};
