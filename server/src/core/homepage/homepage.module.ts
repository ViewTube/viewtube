import { CacheModule } from '@nestjs/cache-manager';
import type { ModuleMetadata } from '@nestjs/common';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheConfigService } from 'server/cache-config.service';
import { HomepageController } from './homepage.controller';
import { HomepageService } from './homepage.service';

const moduleMetadata: ModuleMetadata = {
  providers: [HomepageService, Logger],
  controllers: [HomepageController],
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService
    }),
    ConfigModule.forRoot()
  ]
};
@Module(moduleMetadata)
export class HomepageModule {}
