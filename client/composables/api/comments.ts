export const useGetComments = (videoId: string) => {
  const { apiUrl } = useApiUrl();

  return useLazyFetch(`${apiUrl}comments/${videoId}`);
};

export const useGetCommentsContinuation = (
  videoId: string,
  { continuationLink }: { continuationLink: string }
) => {
  const { apiUrl } = useApiUrl();

  return useLazyFetch(
    `${apiUrl}comments/${videoId}?continuation=${continuationLink}`
  );
};
