import { Result } from 'ytsr';
import { LocationQuery } from 'vue-router';

export type FilterType = { filterValue: any; filterType?: any; filterName: any };

export const useGetSearchResult = () => {
  const route = useRoute();
  const searchQuery = ref(getSearchQuery(route.query));

  watch(
    () => route.query,
    () => {
      searchQuery.value = getSearchQuery(route.query);
    }
  );

  return useLazyAsyncData(
    `search`,
    async () => {
      try {
        const { apiUrl } = useApiUrl();
        const filtersResponse = await getFilters(searchQuery.value, apiUrl.value);

        const filterArray = getFilterArray(route.query, filtersResponse);

        const searchResponse = await getSearch(
          searchQuery.value,
          {
            filters: filterArray,
            pages: 1
          },
          apiUrl.value
        );

        return {
          filters: filtersResponse,
          searchResults: searchResponse
        };
      } catch (error) {
        console.log('error', error);
      }
    },
    {
      watch: [searchQuery]
    }
  );
};

const getSearchQuery = (query: LocationQuery) => {
  const searchParams = new URLSearchParams(query as Record<string, string>);
  return searchParams.get('search_query') ?? searchParams.get('q');
};

const getFilters = (searchTerm: string, apiUrl: string) => {
  return vtFetch<[{ filterValue: any; filterType?: any; filterName: any }]>(
    `${apiUrl}search/filters?q=${searchTerm}`
  );
};

const getSearch = (
  searchTerm: string,
  { filters, pages = 1 }: { filters: Array<any>; pages: number },
  apiUrl: string
) => {
  return vtFetch<Result>(
    `${apiUrl}search?q=${searchTerm}&pages=${pages}&filters=${encodeURIComponent(
      JSON.stringify(filters)
    )}`
  );
};

const getFilterArray = (query: LocationQuery, filters: FilterType[]): Array<any> => {
  const allParams = (new URLSearchParams(query as any) as any).entries();
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
