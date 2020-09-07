import {
  Controller,
  UseInterceptors,
  CacheInterceptor,
  ClassSerializerInterceptor,
  SerializeOptions,
  Get,
  Body
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchResponseDto } from './dto/search-response.dto';
import { SearchQueryDto } from './dto/search-query.dto';

@ApiTags('Core')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    excludePrefixes: ['_']
  })
  @Get()
  async search(
    @Body() searchQuery: SearchQueryDto
  ): Promise<SearchResponseDto> {
    return this.searchService.doSearch(searchQuery);
  }
}
