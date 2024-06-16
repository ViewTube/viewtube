export const useGetComments = (videoId: string) => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const urlPart = `comments/${videoId}`;

  return useLazyAsyncData(urlPart, () => vtFetch(`${apiUrl.value}${urlPart}`));
};

export const useGetCommentsContinuation = (
  videoId: string,
  { continuationLink }: { continuationLink: string }
) => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const urlPart = `comments/${videoId}?continuation=${continuationLink}`;

  return useLazyAsyncData(urlPart, () => vtFetch(`${apiUrl.value}${urlPart}`));
};
