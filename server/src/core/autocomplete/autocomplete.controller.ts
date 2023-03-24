import { Controller, Get, Query, UseInterceptors, Header } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';
import { AutocompleteService } from './autocomplete.service';

@ApiTags('Core')
@UseInterceptors(CacheInterceptor)
@Controller('autocomplete')
export class AutocompleteController {
  constructor(private autocompleteService: AutocompleteService) {}

  @CacheTTL(86400000)
  @Header('Cache-Control', 'public, max-age=86400')
  @Get()
  getQuery(@Query('q') query: string): Promise<Array<string>> {
    return this.autocompleteService.getAutocompleteResult(query);
  }
}
