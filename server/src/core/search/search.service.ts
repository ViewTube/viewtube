import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { innertubeClient } from 'server/common/innertube/innertube';
import { toVTSearchResultDto } from 'server/mapper/converter/search/vt-search-result.converter';
import { VTSearchDto } from 'server/mapper/dto/search/vt-search.dto';
import { Endpoints, Parser, Proto, YTNodes } from 'youtubei.js';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(private readonly logger: Logger) {}

  async getSearch(searchQuery: SearchQueryDto): Promise<VTSearchDto> {
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

    const innertube = await innertubeClient();

    const rawResults = await innertube.actions.execute(
      Endpoints.SearchEndpoint.PATH,
      Endpoints.SearchEndpoint.build({
        continuation: searchQuery.continuationString,
        query: searchQuery.q,
        params: searchQuery.filters ? Proto.encodeSearchFilters(searchQuery.filters) : undefined
      })
    );

    const parsedResults = Parser.parseResponse(rawResults.data);

    const contents =
      parsedResults.contents_memo?.getType(YTNodes.SectionList).first().contents ||
      parsedResults.on_response_received_commands?.first().contents;

    const results = contents
      .find(
        content =>
          content.is(YTNodes.ItemSection) && content.contents && content.contents.length > 0
      )
      ?.as(YTNodes.ItemSection).contents;

    const continuationItems = [
      parsedResults.contents_memo?.getType(YTNodes.ContinuationItem),
      parsedResults.continuation_contents_memo?.getType(YTNodes.ContinuationItem),
      parsedResults.on_response_received_commands_memo?.getType(YTNodes.ContinuationItem),
      parsedResults.on_response_received_endpoints_memo?.getType(YTNodes.ContinuationItem),
      parsedResults.on_response_received_actions_memo?.getType(YTNodes.ContinuationItem),
      parsedResults.sidebar_memo?.getType(YTNodes.ContinuationItem),
      parsedResults.header_memo?.getType(YTNodes.ContinuationItem)
    ]
      .flat()
      .filter(Boolean);

    const continuationToken = continuationItems?.find(
      el =>
        el.type === 'ContinuationItem' &&
        el.endpoint?.payload?.request === 'CONTINUATION_REQUEST_TYPE_SEARCH'
    )?.endpoint?.payload?.token;

    const searchResults = {
      results,
      estimated_results: parsedResults.estimated_results,
      refinements: parsedResults.refinements,
      continuation: continuationToken
    };

    return toVTSearchResultDto(searchResults);
  }
}
