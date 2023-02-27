import { ApiDto } from 'viewtube/shared';

export const useGetHomeFeed = () => {
  const { apiUrl } = useApiUrl();

  const urlPart = 'homepage/homefeed';

  return useLazyAsyncData<ApiDto<'HomeFeedDto'>>(urlPart, () =>
    $fetch(`${apiUrl.value}${urlPart}`)
  );
};
