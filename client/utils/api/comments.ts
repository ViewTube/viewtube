import { ApiDto } from 'viewtube/shared';

export const getComments = (id: string | string[]) => {
  const { apiUrl } = useApiUrl();

  return $fetch<ApiDto<'CommentsResponseDto'>>(`${apiUrl}comments/${id}`);
};

export const getCommentsContinuation = (id: string | string[], continuation: string) => {
  const { apiUrl } = useApiUrl();

  return $fetch<ApiDto<'CommentsResponseDto'>>(
    `${apiUrl}comments/${id}?continuation=${continuation}`
  );
};

export const getCommentReplies = (id: string | string[], replyToken: string) => {
  const { apiUrl } = useApiUrl();

  return $fetch<ApiDto<'CommentsResponseDto'>>(
    `${apiUrl}comments/${id}/replies?replyToken=${replyToken}`
  );
};
