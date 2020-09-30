import { Module, CacheModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { VideosController } from './videos/videos.controller';
import { VideosService } from './videos/videos.service';
import { VideoplaybackController } from './videoplayback/videoplayback.controller';
import { VideoplaybackService } from './videoplayback/videoplayback.service';
import { AutocompleteModule } from './autocomplete/autocomplete.module';
import { Video, VideoSchema } from './videos/schemas/video.schema';
import { VideoBasicInfo, VideoBasicInfoSchema } from './videos/schemas/video-basic-info.schema';
import {
  ChannelBasicInfo,
  ChannelBasicInfoSchema
} from './channels/schemas/channel-basic-info.schema';
import { SearchModule } from './search/search.module';
import { ChannelsModule } from './channels/channels.module';
import { General, GeneralSchema } from 'server/common/general.schema';

@Module({
  imports: [
    CacheModule.register({
      ttl: 1200,
      max: 200
    }),
    MongooseModule.forFeature([
      {
        name: Video.name,
        schema: VideoSchema,
        collection: 'videos'
      },
      {
        name: VideoBasicInfo.name,
        schema: VideoBasicInfoSchema,
        collection: 'videos-basicinfo'
      },
      {
        name: ChannelBasicInfo.name,
        schema: ChannelBasicInfoSchema,
        collection: 'channel-basicinfo'
      },
      {
        name: General.name,
        schema: GeneralSchema,
        collection: 'general'
      }
    ]),
    AutocompleteModule,
    ConfigModule.forRoot(),
    SearchModule,
    ChannelsModule
  ],
  controllers: [VideosController, VideoplaybackController],
  providers: [VideosService, VideoplaybackService],
  exports: [VideosService, VideoplaybackService]
})
export class CoreModule {}
