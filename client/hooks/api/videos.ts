export const useGetVideos = (id: string) => {
  const config = useRuntimeConfig();

  return useLazyFetch(`${config.public.apiUrl}videos/${id}`);
};
