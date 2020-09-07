export class SearchQueryDto {
  q: string;
  page?: number;
  sortBy?: 'relevance' | 'rating' | 'upload_date' | 'view_count';
  date?: 'hour' | 'today' | 'week' | 'month' | 'year';
  duration?: 'short' | 'long';
  type?: 'video' | 'playlist' | 'channel' | 'all' = 'video';
  /**
   * @description hd, subtitles, creative_commons, 3d, live, purchased, 4k, 360, location, hdr
   */
  features?: Array<string>;
  region = 'US';
}
