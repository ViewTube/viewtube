import { Module, CacheModule, ModuleMetadata } from '@nestjs/common';
import { AutocompleteService } from './autocomplete.service';
import { AutocompleteController } from './autocomplete.controller';

const moduleMetadata: ModuleMetadata = {
  providers: [AutocompleteService],
  controllers: [AutocompleteController],
  imports: [
    CacheModule.register({
      ttl: 100,
      max: 500
    })
  ]
};
@Module(moduleMetadata)
export class AutocompleteModule {}
