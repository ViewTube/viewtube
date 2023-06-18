import { ApiDto } from 'viewtube/shared';

export const getComments = (id: string | string[]) => {
  const { apiUrl } = useApiUrl();

  return vtFetch<ApiDto<'CommentsResponseDto'>>(`${apiUrl.value}comments/${id}`);
};

export const getCommentsContinuation = (id: string | string[], continuation: string) => {
  const { apiUrl } = useApiUrl();

  return vtFetch<ApiDto<'CommentsResponseDto'>>(
    `${apiUrl.value}comments/${id}?continuation=${continuation}`
  );
};

export const getCommentReplies = (id: string | string[], replyToken: string) => {
  const { apiUrl } = useApiUrl();

  return vtFetch<ApiDto<'CommentsResponseDto'>>(
    `${apiUrl.value}comments/${id}/replies?replyToken=${replyToken}`
  );
};
