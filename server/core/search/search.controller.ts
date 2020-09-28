import { Controller, UseInterceptors, CacheInterceptor, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { ISearchResponse } from './interface/search-response.interface';

@ApiTags('Core')
@Controller('search')
@UseInterceptors(CacheInterceptor)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('filters')
  getFilters(@Query('q') searchString: string): Promise<any> {
    return this.searchService.getFilters(searchString);
  }

  @Get()
  search(@Query() searchQuery: SearchQueryDto): Promise<ISearchResponse> {
    return this.searchService.doSearch(searchQuery);
  }
}
