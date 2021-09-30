import { Module, CacheModule, ModuleMetadata } from '@nestjs/common';
import { CacheConfigService } from 'viewtube/server/cache-config.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

const moduleMetadata: ModuleMetadata = {
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService
    })
  ],
  controllers: [SearchController],
  providers: [SearchService]
};
@Module(moduleMetadata)
export class SearchModule {}
