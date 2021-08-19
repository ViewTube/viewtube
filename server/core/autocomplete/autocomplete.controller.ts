import {
  Controller,
  Get,
  Query,
  CacheInterceptor,
  UseInterceptors,
  CacheTTL
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AutocompleteService } from './autocomplete.service';

@ApiTags('Core')
@UseInterceptors(CacheInterceptor)
@Controller('autocomplete')
export class AutocompleteController {
  constructor(private autocompleteService: AutocompleteService) {}

  @Get()
  @CacheTTL(86400)
  getQuery(@Query('q') query: string): Promise<Array<string>> {
    return this.autocompleteService.getAutocompleteResult(query);
  }
}
