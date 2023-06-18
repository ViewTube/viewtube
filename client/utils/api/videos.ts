import { ApiDto } from 'viewtube/shared';

export const getDislikes = (id: string | string[]) => {
  const { apiUrl } = useApiUrl();

  return vtFetch<ApiDto<'DislikeDto'>>(`${apiUrl.value}videos/dislikes/${id}`);
};
