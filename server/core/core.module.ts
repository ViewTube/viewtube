import { Module, CacheModule } from '@nestjs/common';
import { VideosController } from './videos/videos.controller';
import { VideosService } from './videos/videos.service';
import { VideoplaybackController } from './videoplayback/videoplayback.controller';
import { VideoplaybackService } from './videoplayback/videoplayback.service';
import { AutocompleteModule } from './autocomplete/autocomplete.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './videos/schemas/video.schema';
import { ConfigModule } from '@nestjs/config';
import { VideoBasicInfo, VideoBasicInfoSchema } from './videos/schemas/video-basic-info.schema';
import {
  ChannelBasicInfo,
  ChannelBasicInfoSchema
} from './channels/schemas/channel-basic-info.schema';
import { ChannelsController } from './channels/channels.controller';
import { SearchModule } from './search/search.module';
import { ChannelsModule } from './channels/channels.module';
import { General, GeneralSchema } from 'server/common/general.schema';

@Module({
  imports: [
    CacheModule.register({
      ttl: 300,
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
