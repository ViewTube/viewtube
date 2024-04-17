import { CacheModule } from '@nestjs/cache-manager';
import type { ModuleMetadata } from '@nestjs/common';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BlockedVideo, BlockedVideoSchema } from 'server/admin/schemas/blocked-video';
import { CacheConfigService } from 'server/cache-config.service';
import { General, GeneralSchema } from 'server/common/general.schema';
import { User, UserSchema } from 'server/user/schemas/user.schema';
import { AutocompleteModule } from './autocomplete/autocomplete.module';
import { ChannelsModule } from './channels/channels.module';
import {
  ChannelBasicInfo,
  ChannelBasicInfoSchema
} from './channels/schemas/channel-basic-info.schema';
import { CommentsModule } from './comments/comments.module';
import { HomepageModule } from './homepage/homepage.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { ProxyModule } from './proxy/proxy.module';
import { SearchModule } from './search/search.module';
import { VideoplaybackController } from './videoplayback/videoplayback.controller';
import { VideoplaybackService } from './videoplayback/videoplayback.service';
import { VideoBasicInfo, VideoBasicInfoSchema } from './videos/schemas/video-basic-info.schema';
import { VideosController } from './videos/videos.controller';
import { VideosService } from './videos/videos.service';

const moduleMetadata: ModuleMetadata = {
  imports: [
    MongooseModule.forFeature([
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
      },
      {
        name: User.name,
        schema: UserSchema,
        collection: 'users'
      },
      {
        name: BlockedVideo.name,
        schema: BlockedVideoSchema,
        collection: 'blocked-videos'
      }
    ]),
    CacheModule.registerAsync({
      useClass: CacheConfigService
    }),
    AutocompleteModule,
    ConfigModule.forRoot(),
    SearchModule,
    ChannelsModule,
    HomepageModule,
    ProxyModule,
    CommentsModule,
    PlaylistsModule
  ],
  controllers: [VideosController, VideoplaybackController],
  providers: [VideosService, VideoplaybackService, Logger],
  exports: [VideosService, VideoplaybackService]
};
@Module(moduleMetadata)
export class CoreModule {}
