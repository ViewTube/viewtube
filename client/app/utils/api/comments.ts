import type { ApiDto } from '@viewtube/shared';

export const getComments = (id: string | string[]) => {
  const { apiUrl } = useApiUrl();

  return vtClientFetch<ApiDto<'VTCommentsResponseDto'>>(`${apiUrl.value}comments/${id}`);
};

export const getCommentsContinuation = (id: string | string[], continuation: string) => {
  const { apiUrl } = useApiUrl();

  return vtClientFetch<ApiDto<'VTCommentsResponseDto'>>(
    `${apiUrl.value}comments/${id}?continuation=${continuation}`
  );
};

export const getCommentReplies = (replyContinuation: string) => {
  const { apiUrl } = useApiUrl();

  return vtClientFetch<ApiDto<'VTCommentsReplyResponseDto'>>(
    `${apiUrl.value}comments/replies?replyContinuation=${replyContinuation}`
  );
};
