import { Module, CacheModule } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 300,
      max: 200
    })
  ],
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule {}
