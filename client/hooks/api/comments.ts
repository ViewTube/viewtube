export const useGetComments = (videoId: string) => {
  const config = useRuntimeConfig();

  return useLazyFetch(`${config.apiUrl}comments/${videoId}`);
};

export const useGetCommentsContinuation = (
  videoId: string,
  { continuationLink }: { continuationLink: string }
) => {
  const config = useRuntimeConfig();

  return useLazyFetch(`${config.apiUrl}comments/${videoId}?continuation=${continuationLink}`);
};
