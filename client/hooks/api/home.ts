export const useGetPopularPage = () => {
  const config = useRuntimeConfig();

  return useLazyFetch(`${config.public.apiUrl}homepage/popular`);
};
