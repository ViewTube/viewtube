export const useGetFilters = (searchTerm: string) => {
  const config = useRuntimeConfig();

  return useLazyFetch(`${config.public.apiUrl}search/filters?q=${searchTerm}`);
};

export const useGetSearch = (
  searchTerm: string,
  { filters, pages = 1 }: { filters: Array<any>; pages: number }
) => {
  const config = useRuntimeConfig();

  return useLazyFetch(
    `${config.public.apiUrl}search?q=${searchTerm}&pages=${pages}&filters=${JSON.stringify(filters)}`
  );
};
