import { type LocationQuery } from 'vue-router';
import type { VTSearchDto } from '../../../server/src/mapper/dto/search/vt-search.dto';

export type FilterType = { filterValue: any; filterType?: any; filterName: any };

export const useGetSearchResult = () => {
  const route = useRoute();
  const { vtFetch } = useVtFetch();
  const searchQuery = ref(getSearchQuery(route.query));
  const searchFilters = ref(getSearchFilters(route.query));

  watch(
    () => route.query,
    () => {
      searchQuery.value = getSearchQuery(route.query);
      searchFilters.value = getSearchFilters(route.query);
    }
  );

  return useLazyAsyncData(
    `search`,
    async () => {
      const { apiUrl } = useApiUrl();
      const searchResponse = await vtFetch<VTSearchDto>(`${apiUrl.value}search`, {
        query: { q: searchQuery.value, filters: searchFilters.value }
      });

      return searchResponse;
    },
    {
      watch: [searchQuery, searchFilters]
    }
  );
};

const getSearchFilters = (query: LocationQuery) => {
  const searchParams = new URLSearchParams(query as Record<string, string>);
  const filters: Record<string, string> = {};

  searchFilters
    .map(filter => {
      const filterValue = searchParams.get(filter.type);
      return {
        type: filter.type,
        value: filterValue
      };
    })
    .filter(filter => filter.value)
    .forEach(filter => {
      filters[filter.type] = filter.value;
    });

  return filters;
};

const getSearchQuery = (query: LocationQuery) => {
  const searchParams = new URLSearchParams(query as Record<string, string>);
  return searchParams.get('search_query') ?? searchParams.get('q');
};
