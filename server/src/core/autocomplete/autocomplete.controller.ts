import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Header, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BypassAuth } from 'server/auth/decorators/bypass-auth.decorator';
import type { AutocompleteService } from './autocomplete.service';

@ApiTags('Core')
@UseInterceptors(CacheInterceptor)
@BypassAuth()
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
