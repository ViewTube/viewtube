import { ApiDto } from 'viewtube/shared';

export const getDislikes = (id: string | string[]) => {
  const config = useRuntimeConfig();

  return $fetch<ApiDto<'DislikeDto'>>(`${config.public.apiUrl}videos/dislikes/${id}`);
};
