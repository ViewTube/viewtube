import { ApiDto, ApiErrorDto } from 'viewtube/shared';

type ChannelDtoType = Omit<ApiDto<'ChannelDto'>, 'videoSections'> & {
  videoSections: {
    title: string;
    type: 'single' | 'multi';
    video: Record<string, any>;
    elements: { type: 'video' | 'playlist' }[];
  }[];
};

export const useGetChannels = (id: string | string[]) => {
  const { apiUrl } = useApiUrl();

  return useLazyFetch<ChannelDtoType, ApiErrorDto>(`${apiUrl}channels/${id}`);
};
