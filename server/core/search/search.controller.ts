import {
  Controller,
  UseInterceptors,
  CacheInterceptor,
  Get,
  Query,
  Req,
  BadRequestException
} from '@nestjs/common';
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
    if (request.query.continuationData) {
      return this.searchService.continueSearch(request.query.continuationData);
    }
    throw new BadRequestException('Invalid continuation data');
  }

  @Get()
  search(@Query() searchQuery: SearchQueryDto): Promise<Result> {
    return this.searchService.doSearch(searchQuery);
  }
}
