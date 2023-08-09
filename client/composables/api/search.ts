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
        const searchResponse = await getSearch(searchQuery.value, apiUrl.value);

        return {
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

const getSearch = (searchTerm: string, apiUrl: string) => {
  return vtFetch<Result>(`${apiUrl}search/v2?q=${searchTerm}`);
};
