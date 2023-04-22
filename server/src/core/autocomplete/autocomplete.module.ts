import { Module, ModuleMetadata } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheConfigService } from 'server/cache-config.service';
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
