import { CacheModule, Module, ModuleMetadata } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
    CacheModule.register({
      ttl: 3600,
      max: 20
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
      }
    ])
  ]
};
@Module(moduleMetadata)
export class HomepageModule {}
