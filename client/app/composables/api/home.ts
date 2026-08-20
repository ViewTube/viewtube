import type { ApiDto } from '@viewtube/shared';

export const useGetHomeFeed = (enabled: MaybeRefOrGetter<boolean> = true) => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const urlPart = 'homepage/homefeed';

  return useLazyAsyncData<ApiDto<'HomeFeedDto'>>(
    urlPart,
    () => vtFetch(`${apiUrl.value}${urlPart}`),
    { immediate: toValue(enabled) }
  );
};
