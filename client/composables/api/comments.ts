export const useGetComments = (videoId: string) => {
  const { apiUrl } = useApiUrl();

  const urlPart = `comments/${videoId}`;

  return useLazyAsyncData(urlPart, () => $fetch(`${apiUrl.value}${urlPart}`));
};

export const useGetCommentsContinuation = (
  videoId: string,
  { continuationLink }: { continuationLink: string }
) => {
  const { apiUrl } = useApiUrl();

  const urlPart = `comments/${videoId}?continuation=${continuationLink}`;

  return useLazyAsyncData(urlPart, () => $fetch(`${apiUrl.value}${urlPart}`));
};
