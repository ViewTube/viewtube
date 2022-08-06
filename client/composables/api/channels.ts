import { ChannelDto, ApiErrorDto } from 'viewtube/shared';

export const useGetChannels = (id: string | string[]) => {
  const config = useRuntimeConfig();

  return useLazyFetch<ChannelDto, ApiErrorDto>(`${config.public.apiUrl}channels/${id}`);
};
