import {
  Controller,
  UseInterceptors,
  CacheInterceptor,
  Get,
  Query,
  BadRequestException
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Result } from 'ytsr';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchFilterDto } from './dto/search-filter.dto';

@ApiTags('Core')
@Controller('search')
@UseInterceptors(CacheInterceptor)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('filters')
  getFilters(@Query('q') searchString: string): Promise<Array<SearchFilterDto>> {
    return this.searchService.getFilters(searchString);
  }

  @Get('continuation')
  searchContinuation(@Query('continuationData[]') continuationData: Array<any>) {
    if (continuationData) {
      return this.searchService.continueSearch(continuationData);
    }
    throw new BadRequestException('Invalid continuation data');
  }

  @Get()
  search(@Query() searchQuery: SearchQueryDto): Promise<Result> {
    return this.searchService.doSearch(searchQuery);
  }
}
