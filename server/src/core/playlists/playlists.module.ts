import { Module, ModuleMetadata } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { CacheConfigService } from 'server/cache-config.service';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';

const moduleMetadata: ModuleMetadata = {
  providers: [PlaylistsService],
  controllers: [PlaylistsController],
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      useClass: CacheConfigService
    })
  ]
};

@Module(moduleMetadata)
export class PlaylistsModule {}
