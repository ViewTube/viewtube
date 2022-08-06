import { ChannelDto } from 'viewtube/shared';

export const useGetChannels = (id: string) => {
  const config = useRuntimeConfig();

  return useLazyFetch<ChannelDto>(`${config.public.apiUrl}channels/${id}`);
};
