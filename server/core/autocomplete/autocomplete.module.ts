import { Module, CacheModule } from '@nestjs/common';
import { AutocompleteService } from './autocomplete.service';
import { AutocompleteController } from './autocomplete.controller';

@Module({
  providers: [AutocompleteService],
  controllers: [AutocompleteController],
  imports: [CacheModule.register({
    ttl: 100,
    max: 500,
  })]
})
export class AutocompleteModule { }
