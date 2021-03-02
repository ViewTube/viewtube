import { Module, CacheModule, ModuleMetadata } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

const moduleMetadata: ModuleMetadata = {
  imports: [
    CacheModule.register({
      ttl: 300,
      max: 200
    })
  ],
  controllers: [SearchController],
  providers: [SearchService]
};
@Module(moduleMetadata)
export class SearchModule {}
