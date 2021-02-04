import { Options } from 'ytsr';
import { SelectedFilterDto } from './selected-filter.dto';
export class SearchQueryDto implements Options {
  q: string;
  pages?: number;
  limit?: number;
  safeSearch?: boolean;
  hl?: string;
  gl?: string;
  filters?: Array<SelectedFilterDto>;
}
