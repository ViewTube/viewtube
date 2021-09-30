import { CacheModule, Module, ModuleMetadata } from '@nestjs/common';
import { CacheConfigService } from 'viewtube/server/cache-config.service';
import { AutocompleteService } from './autocomplete.service';
import { AutocompleteController } from './autocomplete.controller';

const moduleMetadata: ModuleMetadata = {
  providers: [AutocompleteService],
  controllers: [AutocompleteController],
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService
    })
  ]
};
@Module(moduleMetadata)
export class AutocompleteModule {}
