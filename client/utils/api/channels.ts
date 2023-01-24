import { ApiDto } from 'viewtube/shared';

export const getChannelVideosContinuation = (continuation: string) => {
  const { apiUrl } = useApiUrl();

  return $fetch<ApiDto<'ChannelVideosContinuationDto'>>(
    `${apiUrl.value}channels/videos/continuation`,
    {
      query: {
        continuation
      }
    }
  );
};
