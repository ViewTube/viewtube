import { CacheModule } from '@nestjs/cache-manager';
import { ModuleMetadata } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheConfigService } from 'server/cache-config.service';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsService } from './playlists.service';

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
