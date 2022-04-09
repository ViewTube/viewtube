export const useGetVideos = (id: string) => {
  const config = useRuntimeConfig();

  return useLazyFetch(`${config.apiUrl}videos/${id}`);
};
