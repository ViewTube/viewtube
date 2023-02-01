import { CacheModule, Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheConfigService } from 'server/cache-config.service';
import {
  VideoBasicInfo,
  VideoBasicInfoSchema
} from 'server/core/videos/schemas/video-basic-info.schema';
import { SettingsModule } from '../settings/settings.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

const moduleMetadata: ModuleMetadata = {
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      useClass: CacheConfigService
    })
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
};
@Module(moduleMetadata)
export class AdminModule {}
