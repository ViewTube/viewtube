import { ApiDto } from 'viewtube/shared';

export const getDislikes = (id: string | string[]) => {
  const config = useRuntimeConfig();

  return $fetch<ApiDto<'DislikeDto'>>(`${config.public.apiUrl}videos/dislikes/${id}`);
};

export const getComments = (id: string | string[]) => {
  const config = useRuntimeConfig();

  return $fetch<ApiDto<'CommentsResponseDto'>>(`${config.public.apiUrl}comments/${id}`);
};

export const getCommentsContinuation = (id: string | string[], continuation: string) => {
  const config = useRuntimeConfig();

  return $fetch<ApiDto<'CommentsResponseDto'>>(`${config.public.apiUrl}comments/${id}${continuation}`);
};
