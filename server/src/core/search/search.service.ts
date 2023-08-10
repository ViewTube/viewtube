import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SearchQueryDto } from './dto/search-query.dto';
import { VTSearchDto } from 'server/mapper/dto/search/vt-search.dto';
import { innertubeClient } from 'server/common/innertube/innertube';
import { toVTSearchResultDto } from 'server/mapper/converter/search/vt-search-result.converter';

@Injectable()
export class SearchService {
  constructor(private readonly logger: Logger) {}

  async doSearch(searchQuery: SearchQueryDto): Promise<VTSearchDto> {
    if (!searchQuery) {
      throw new BadRequestException(`Search query is required`);
    }

    const client = await innertubeClient();
    const searchResults = await client.search(searchQuery.q, searchQuery.filters);

    return toVTSearchResultDto(searchResults);
  }
}
