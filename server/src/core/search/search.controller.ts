import { CacheInterceptor } from '@nestjs/cache-manager';
import { Controller, Get, Header, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VTSearchDto } from 'server/mapper/dto/search/vt-search.dto';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchService } from './search.service';

@ApiTags('Core')
@Controller('search')
@UseInterceptors(CacheInterceptor)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=1800')
  search(@Query() searchQuery: SearchQueryDto): Promise<VTSearchDto> {
    return this.searchService.getSearch(searchQuery);
  }
}
