import { ApiDto } from 'viewtube/shared';

export const getDislikes = (id: string | string[]) => {
  const { apiUrl } = useApiUrl();

  return $fetch<ApiDto<'DislikeDto'>>(`${apiUrl}videos/dislikes/${id}`);
};
