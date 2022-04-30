import { FilterValueDto } from './filter-value.dto';

export class SearchFilterDto {
  filterType: string;
  filterValues: Array<FilterValueDto>;
}
