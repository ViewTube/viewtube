import { Options } from 'ytsr';
export class SearchQueryDto implements Options {
  q: string;
  pages?: number;
  limit?: number;
  safeSearch?: boolean;
  hl?: string;
  gl?: string;
}
