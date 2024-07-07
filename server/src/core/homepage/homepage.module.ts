import { CacheModule } from '@nestjs/cache-manager';
import { Logger, Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheConfigService } from 'server/cache-config.service';
import { HistoryModule } from 'server/user/history/history.module';
import { HomepageController } from './homepage.controller';
import { HomepageService } from './homepage.service';

const moduleMetadata: ModuleMetadata = {
  providers: [HomepageService, Logger],
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
