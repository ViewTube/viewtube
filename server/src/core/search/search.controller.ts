import {
  Controller,
  UseInterceptors,
  Get,
  Query,
  BadRequestException,
  Header,
  Post,
  Body
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
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
  @Header('Cache-Control', 'public, max-age=1800')
  getFilters(@Query('q') searchString: string): Promise<Array<SearchFilterDto>> {
    return this.searchService.getFilters(searchString);
  }

  @Post('continuation')
  @Header('Cache-Control', 'public, max-age=1800')
  searchContinuation(@Body() searchContinuation: { continuationData: Array<any> }) {
    if (searchContinuation?.continuationData) {
      return this.searchService.continueSearch(searchContinuation?.continuationData);
    }
    throw new BadRequestException('Invalid continuation data');
  }

  @Get()
  @Header('Cache-Control', 'public, max-age=1800')
  search(@Query() searchQuery: SearchQueryDto): Promise<Result> {
    return this.searchService.doSearch(searchQuery);
  }
}
