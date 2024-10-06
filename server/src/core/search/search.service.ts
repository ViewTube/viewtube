import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { innertubeClient } from 'server/common/innertube/innertube';
import { toVTSearchResultDto } from 'server/mapper/converter/search/vt-search-result.converter';
import { VTSearchDto } from 'server/mapper/dto/search/vt-search.dto';
import { Endpoints, Parser, YTNodes } from 'youtubei.js';
import { SearchFilter, SearchFilter_Filters_Duration, SearchFilter_Filters_SearchType, SearchFilter_Filters_UploadDate, SearchFilter_SortBy } from 'youtubei.js/dist/protos/generated/misc/params';
import { u8ToBase64 } from 'youtubei.js/dist/src/utils/Utils';
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

    let searchFilters;
    if (searchQuery.filters) {
      const filters = searchQuery.filters;
      const search_filter: SearchFilter = {};

      search_filter.filters = {};

      if (filters.sort_by) {
        search_filter.sortBy =
          SearchFilter_SortBy[filters.sort_by.toUpperCase() as keyof typeof SearchFilter_SortBy];
      }

      if (filters.upload_date) {
        search_filter.filters.uploadDate =
          SearchFilter_Filters_UploadDate[
            filters.upload_date.toUpperCase() as keyof typeof SearchFilter_Filters_UploadDate
          ];
      }

      if (filters.type) {
        search_filter.filters.type =
          SearchFilter_Filters_SearchType[
            filters.type.toUpperCase() as keyof typeof SearchFilter_Filters_SearchType
          ];
      }

      if (filters.duration) {
        search_filter.filters.duration =
          SearchFilter_Filters_Duration[
            filters.duration.toUpperCase() as keyof typeof SearchFilter_Filters_Duration
          ];
      }

      if (filters.features) {
        for (const feature of filters.features) {
          switch (feature) {
            case '360':
              search_filter.filters.features360 = true;
              break;
            case '3d':
              search_filter.filters.features3d = true;
              break;
            case '4k':
              search_filter.filters.features4k = true;
              break;
            case 'creative_commons':
              search_filter.filters.featuresCreativeCommons = true;
              break;
            case 'hd':
              search_filter.filters.featuresHd = true;
              break;
            case 'hdr':
              search_filter.filters.featuresHdr = true;
              break;
            case 'live':
              search_filter.filters.featuresLive = true;
              break;
            case 'location':
              search_filter.filters.featuresLocation = true;
              break;
            case 'purchased':
              search_filter.filters.featuresPurchased = true;
              break;
            case 'subtitles':
              search_filter.filters.featuresSubtitles = true;
              break;
            case 'vr180':
              search_filter.filters.featuresVr180 = true;
              break;
            default:
              break;
          }
        }
      }

      searchFilters = encodeURIComponent(u8ToBase64(SearchFilter.encode(search_filter).finish()));
    }

    const rawResults = await innertube.actions.execute(
      Endpoints.SearchEndpoint.PATH,
      Endpoints.SearchEndpoint.build({
        continuation: searchQuery.continuationString,
        query: searchQuery.q,
        params: searchFilters
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
