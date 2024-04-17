import type { Logger } from '@nestjs/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import { innertubeClient } from 'server/common/innertube/innertube';
import { toVTSearchResultDto } from 'server/mapper/converter/search/vt-search-result.converter';
import type { VTSearchDto } from 'server/mapper/dto/search/vt-search.dto';
import type { SearchFiltersDto } from './dto/search-filters.dto';
import type { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(private readonly logger: Logger) {}

  async doSearch(searchQuery: SearchQueryDto): Promise<VTSearchDto> {
    if (!searchQuery) {
      throw new BadRequestException(`Search query is required`);
    }

    if (searchQuery.filters) {
      searchQuery.filters = JSON.parse(searchQuery.filters.toString());
    }

    if (searchQuery.filters?.features) {
      searchQuery.filters.features = searchQuery.filters.features
        .toString()
        .split(',') as SearchFiltersDto['features'];
    }

    const client = await innertubeClient();
    const searchResults = await client.search(searchQuery.q, searchQuery.filters);

    return toVTSearchResultDto(searchResults);
  }
}
