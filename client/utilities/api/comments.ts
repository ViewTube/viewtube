import { ApiDto } from 'viewtube/shared';

export const getComments = (id: string | string[]) => {
  const config = useRuntimeConfig();

  return $fetch<ApiDto<'CommentsResponseDto'>>(`${config.public.apiUrl}comments/${id}`);
};

export const getCommentsContinuation = (id: string | string[], continuation: string) => {
  const config = useRuntimeConfig();

  return $fetch<ApiDto<'CommentsResponseDto'>>(
    `${config.public.apiUrl}comments/${id}?continuation=${continuation}`
  );
};

export const getCommentReplies = (id: string | string[], replyToken: string) => {
  const config = useRuntimeConfig();

  return $fetch<ApiDto<'CommentsResponseDto'>>(
    `${config.public.apiUrl}comments/${id}/replies?replyToken=${replyToken}`
  );
};
