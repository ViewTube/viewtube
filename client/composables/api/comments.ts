export const useGetComments = (videoId: string) => {
  const config = useRuntimeConfig();

  return useLazyFetch(`${config.public.apiUrl}comments/${videoId}`);
};

export const useGetCommentsContinuation = (
  videoId: string,
  { continuationLink }: { continuationLink: string }
) => {
  const config = useRuntimeConfig();

  return useLazyFetch(
    `${config.public.apiUrl}comments/${videoId}?continuation=${continuationLink}`
  );
};
