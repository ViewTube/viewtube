import { Logger, Module, ModuleMetadata } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { General, GeneralSchema } from 'server/common/general.schema';
import { CacheConfigService } from 'server/cache-config.service';
import { User, UserSchema } from 'server/user/schemas/user.schema';
import { VideosController } from './videos/videos.controller';
import { VideosService } from './videos/videos.service';
import { VideoplaybackController } from './videoplayback/videoplayback.controller';
import { VideoplaybackService } from './videoplayback/videoplayback.service';
import { AutocompleteModule } from './autocomplete/autocomplete.module';
import { VideoBasicInfo, VideoBasicInfoSchema } from './videos/schemas/video-basic-info.schema';
import {
  ChannelBasicInfo,
  ChannelBasicInfoSchema
} from './channels/schemas/channel-basic-info.schema';
import { SearchModule } from './search/search.module';
import { ChannelsModule } from './channels/channels.module';
import { HomepageModule } from './homepage/homepage.module';
import { ProxyModule } from './proxy/proxy.module';
import { CommentsModule } from './comments/comments.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { BlockedVideo, BlockedVideoSchema } from 'server/admin/schemas/blocked-video';

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
