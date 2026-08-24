import { CacheModule } from '@nestjs/cache-manager';
import { Module, ModuleMetadata } from '@nestjs/common';
import { CacheConfigService } from 'server/cache-config.service';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';

const moduleMetadata: ModuleMetadata = {
  providers: [ChannelsService],
  controllers: [ChannelsController],
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService
    })
  ]
};
@Module(moduleMetadata)
export class ChannelsModule {}
