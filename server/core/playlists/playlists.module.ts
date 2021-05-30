import { Module, CacheModule, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';

const moduleMetadata: ModuleMetadata = {
  providers: [PlaylistsService],
  controllers: [PlaylistsController],
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      ttl: 3600,
      max: 20
    })
  ]
};

@Module(moduleMetadata)
export class PlaylistsModule {}
