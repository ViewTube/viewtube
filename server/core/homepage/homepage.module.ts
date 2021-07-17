import { CacheModule, Module, ModuleMetadata } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheConfigService } from 'server/cache-config.service';
import { ApiRequest, ApiRequestSchema } from 'server/metrics/schemas/api-request.schema';
import {
  ChannelBasicInfo,
  ChannelBasicInfoSchema
} from '../channels/schemas/channel-basic-info.schema';
import { HomepageController } from './homepage.controller';
import { HomepageService } from './homepage.service';
import { Popular, PopularSchema } from './schemas/popular.schema';

const moduleMetadata: ModuleMetadata = {
  providers: [HomepageService],
  controllers: [HomepageController],
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService
    }),
    MongooseModule.forFeature([
      {
        name: Popular.name,
        schema: PopularSchema,
        collection: 'homepage-popular'
      },
      {
        name: ChannelBasicInfo.name,
        schema: ChannelBasicInfoSchema,
        collection: 'channel-basicinfo'
      },
      {
        name: ApiRequest.name,
        schema: ApiRequestSchema,
        collection: 'api-requests'
      }
    ])
  ]
};
@Module(moduleMetadata)
export class HomepageModule {}
