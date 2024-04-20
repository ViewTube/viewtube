import { CacheModule } from '@nestjs/cache-manager';
import { ModuleMetadata } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheConfigService } from 'server/cache-config.service';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

const moduleMetadata: ModuleMetadata = {
  providers: [CommentsService],
  controllers: [CommentsController],
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      useClass: CacheConfigService
    })
  ]
};

@Module(moduleMetadata)
export class CommentsModule {}
