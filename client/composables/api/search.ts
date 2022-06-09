import { Result } from 'ytsr';
import { LocationQuery } from 'vue-router';

export type FilterType = { filterValue: any; filterType?: any; filterName: any };

export const useGetSearchResult = (query: LocationQuery, searchQuery: string) => {
  return useLazyAsyncData(
    `search/${query}`,
    async () => {
      try {
        const config = useRuntimeConfig();
        const apiUrl = config.public.apiUrl;
        const filtersResponse = await getFilters(searchQuery, apiUrl);

        const filterArray = getFilterArray(query, filtersResponse);

        const searchResponse = await getSearch(
          searchQuery,
          {
            filters: filterArray,
            pages: 1
          },
          apiUrl
        );

        return {
          filters: filtersResponse,
          searchResults: searchResponse
        };
      } catch (error) {
        console.log('error', error);
      }
    },
    { server: true }
  );
};

const getFilters = (searchTerm: string, apiUrl: string) => {
  return $fetch<[{ filterValue: any; filterType?: any; filterName: any }]>(
    `${apiUrl}search/filters?q=${searchTerm}`
  );
};

const getSearch = (
  searchTerm: string,
  { filters, pages = 1 }: { filters: Array<any>; pages: number },
  apiUrl: string
) => {
  return $fetch<Result>(
    `${apiUrl}search?q=${searchTerm}&pages=${pages}&filters=${encodeURIComponent(
      JSON.stringify(filters)
    )}`
  );
};

const getFilterArray = (query: LocationQuery, filters: FilterType[]): Array<any> => {
  const allParams = new URLSearchParams(query as any).entries();
  const filtersArray = [];
  for (const param of allParams) {
    if (filters.find(el => el.filterType === param[0])) {
      filtersArray.push({
        filterName: param[0],
        filterValue: param[1]
      });
    }
  }
  return filtersArray;
};
