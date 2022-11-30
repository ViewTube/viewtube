import { ChannelDto, ApiErrorDto } from 'viewtube/shared';

export const useGetChannels = (id: string | string[]) => {
  const { apiUrl } = useApiUrl();

  return useLazyFetch<ChannelDto, ApiErrorDto>(`${apiUrl}channels/${id}`);
};
