import { Controller, UseInterceptors, CacheInterceptor, Get, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Continuation, ContinueResult, Result } from 'ytsr';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';

@ApiTags('Core')
@Controller('search')
@UseInterceptors(CacheInterceptor)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('filters')
  getFilters(@Query('q') searchString: string): Promise<any> {
    return this.searchService.getFilters(searchString);
  }

  @Get('continuation')
  searchContinuation(@Req() request: any) {
    console.log(JSON.parse(request));
    // return this.searchService.continueSearch(continuationData);
    return true;
  }

  @Get()
  search(@Query() searchQuery: SearchQueryDto): Promise<Result> {
    return this.searchService.doSearch(searchQuery);
  }
}
