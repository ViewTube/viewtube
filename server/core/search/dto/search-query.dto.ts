import { Options } from 'ytsr';
export class SearchQueryDto implements Options {
  q: string;
  limit?: number;
  safeSearch?: boolean;
  nextpageRef?: string;
  hl?: string;
  gl?: string;
  headers?: { [key: string]: string };
}
