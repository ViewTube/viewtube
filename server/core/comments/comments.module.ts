import { Module, CacheModule, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';

const moduleMetadata: ModuleMetadata = {
  providers: [CommentsService],
  controllers: [CommentsController],
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      ttl: 3600,
      max: 20
    })
  ]
};

@Module(moduleMetadata)
export class CommentsModule {}
