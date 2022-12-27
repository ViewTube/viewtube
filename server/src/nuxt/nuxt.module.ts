import { Module } from '@nestjs/common';
import { NuxtController } from './nuxt.controller';
import { NuxtService } from './nuxt.service';

@Module({
  controllers: [NuxtController],
  providers: [NuxtService]
})
export class NuxtModule {}
