import { Module, CacheModule, ModuleMetadata, Logger } from '@nestjs/common';
import { CacheConfigService } from 'server/cache-config.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

const moduleMetadata: ModuleMetadata = {
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService
    })
  ],
  controllers: [SearchController],
  providers: [SearchService, Logger]
};
@Module(moduleMetadata)
export class SearchModule {}
