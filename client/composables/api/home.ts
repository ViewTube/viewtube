import { ApiDto } from 'viewtube/shared';

export const useGetHomeFeed = () => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const urlPart = 'homepage/homefeed';

  return useLazyAsyncData<ApiDto<'HomeFeedDto'>>(urlPart, () =>
    vtFetch(`${apiUrl.value}${urlPart}`)
  );
};
