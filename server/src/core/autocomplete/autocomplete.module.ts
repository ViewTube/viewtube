import { CacheModule } from '@nestjs/cache-manager';
import { Module, ModuleMetadata } from '@nestjs/common';
import { CacheConfigService } from 'server/cache-config.service';
import { AutocompleteController } from './autocomplete.controller';
import { AutocompleteService } from './autocomplete.service';

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
