import { CacheModule } from '@nestjs/cache-manager';
import { Logger, Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheConfigService } from 'server/cache-config.service';
import { HistoryModule } from 'server/user/history/history.module';
import { CategoryFeedService } from './category-feed/category-feed.service';
import { HomepageController } from './homepage.controller';
import { HomepageService } from './homepage.service';

const moduleMetadata: ModuleMetadata = {
  providers: [HomepageService, CategoryFeedService, Logger],
  controllers: [HomepageController],
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService
    }),
    ConfigModule.forRoot(),
    HistoryModule
  ]
};
@Module(moduleMetadata)
export class HomepageModule {}
