import { CacheModule, Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheConfigService } from 'viewtube/server/cache-config.service';
import {
  VideoBasicInfo,
  VideoBasicInfoSchema
} from 'viewtube/server/core/videos/schemas/video-basic-info.schema';
import { SettingsModule } from '../settings/settings.module';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { History, HistorySchema } from './schemas/history.schema';

const moduleMetadata: ModuleMetadata = {
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: History.name,
        schema: HistorySchema,
        collection: 'user-history'
      },
      {
        name: VideoBasicInfo.name,
        schema: VideoBasicInfoSchema,
        collection: 'videos-basicinfo'
      }
    ]),
    CacheModule.registerAsync({
      useClass: CacheConfigService
    }),
    SettingsModule
  ],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService]
};
@Module(moduleMetadata)
export class HistoryModule {}
