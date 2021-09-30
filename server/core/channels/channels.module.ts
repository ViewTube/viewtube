import { CacheModule, Module, ModuleMetadata } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheConfigService } from 'viewtube/server/cache-config.service';
import { General, GeneralSchema } from 'viewtube/server/common/general.schema';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { ChannelBasicInfo, ChannelBasicInfoSchema } from './schemas/channel-basic-info.schema';

const moduleMetadata: ModuleMetadata = {
  providers: [ChannelsService],
  controllers: [ChannelsController],
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService
    }),
    MongooseModule.forFeature([
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
    ])
  ]
};
@Module(moduleMetadata)
export class ChannelsModule {}
