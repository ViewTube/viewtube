import { CacheModule } from '@nestjs/cache-manager';
import type { ModuleMetadata } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheConfigService } from 'server/cache-config.service';
import { UserModule } from '../user/user.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { BlockedVideo, BlockedVideoSchema } from './schemas/blocked-video';
import { ServerSettings, ServerSettingsSchema } from './schemas/server-settings';

const moduleMetadata: ModuleMetadata = {
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      useClass: CacheConfigService
    }),
    MongooseModule.forFeature([
      {
        name: BlockedVideo.name,
        schema: BlockedVideoSchema,
        collection: 'blocked-videos'
      },
      {
        name: ServerSettings.name,
        schema: ServerSettingsSchema,
        collection: 'server-settings'
      }
    ]),
    UserModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
};
@Module(moduleMetadata)
export class AdminModule {}
