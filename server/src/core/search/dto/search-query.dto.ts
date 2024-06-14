import { SearchFiltersDto } from './search-filters.dto';

export class SearchQueryDto {
  q: string;
  filters?: SearchFiltersDto;
  continuationString?: string;
}
