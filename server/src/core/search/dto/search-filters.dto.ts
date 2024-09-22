import type { SearchFilters } from "youtubei.js/dist/src/types";

export class SearchFiltersDto implements SearchFilters {
  upload_date?: 'all' | 'hour' | 'today' | 'week' | 'month' | 'year';
  type?: 'all' | 'video' | 'channel' | 'playlist' | 'movie';
  duration?: 'all' | 'short' | 'medium' | 'long';
  sort_by?: 'relevance' | 'rating' | 'upload_date' | 'view_count';
  features?: (
    | 'hd'
    | 'subtitles'
    | 'creative_commons'
    | '3d'
    | 'live'
    | 'purchased'
    | '4k'
    | '360'
    | 'location'
    | 'hdr'
    | 'vr180'
  )[];
}
