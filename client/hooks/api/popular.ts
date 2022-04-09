export const useGetPopular = () => {
  const config = useRuntimeConfig();

  return useLazyFetch(`${config.apiUrl}homepage/popular`);
};
