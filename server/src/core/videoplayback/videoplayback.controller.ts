import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { VideoplaybackService } from './videoplayback.service';

@ApiTags('Core')
@Controller('videoplayback')
export class VideoplaybackController {
  constructor(private videoplaybackService: VideoplaybackService) {}

  @Get()
  async getVideoplayback(@Res() reply: FastifyReply, @Req() request: FastifyRequest) {
    await this.videoplaybackService.proxyStream(request, reply);
  }
}
