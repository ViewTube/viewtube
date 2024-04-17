import type { VTSearchDto } from 'server/mapper/dto/search/vt-search.dto';
import type { YT } from 'youtubei.js';
import {
  extractEstimatedResultCount,
  extractRefinements,
  extractSearchResults
} from './vt-search-result.extractors';

export const toVTSearchResultDto = (searchResult: YT.Search): VTSearchDto => {
  return {
    results: extractSearchResults(searchResult.results),
    estimatedResultCount: extractEstimatedResultCount(searchResult),
    refinements: extractRefinements(searchResult)
  };
};
