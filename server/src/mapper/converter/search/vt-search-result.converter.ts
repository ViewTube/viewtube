import { VTSearchDto } from 'server/mapper/dto/search/vt-search.dto';
import { SearchSourceApproximation } from './search-source-approximation';
import { extractSearchResults } from './vt-search-result.extractors';

type SearchResults = {
  results: SearchSourceApproximation[];
  estimated_results?: number;
  refinements?: string[];
  continuation?: string;
};

export const toVTSearchResultDto = (searchResult: SearchResults): VTSearchDto => {
  return {
    results: extractSearchResults(searchResult.results),
    estimatedResultCount: searchResult?.estimated_results,
    refinements: searchResult?.refinements,
    continuation: searchResult?.continuation
  };
};
