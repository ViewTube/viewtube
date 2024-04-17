import { CacheInterceptor } from '@nestjs/cache-manager';
import { Controller, Get, Header, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { VTSearchDto } from 'server/mapper/dto/search/vt-search.dto';
import type { SearchQueryDto } from './dto/search-query.dto';
import type { SearchService } from './search.service';

@ApiTags('Core')
@Controller('search')
@UseInterceptors(CacheInterceptor)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=1800')
  search(@Query() searchQuery: SearchQueryDto): Promise<VTSearchDto> {
    return this.searchService.doSearch(searchQuery);
  }
}
