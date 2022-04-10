export const useGetPopularPage = () => {
  const config = useRuntimeConfig();

  return useLazyFetch(`${config.apiUrl}homepage/popular`);
};
