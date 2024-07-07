import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { ViewTubeRequest } from 'server/common/viewtube-request';
import { HomeFeedDto } from './dto/home-feed.dto';
import { HomepageService } from './homepage.service';

@ApiTags('Core')
@Controller('homepage')
export class HomepageController {
  constructor(private homepageService: HomepageService) {}

  @Get('homefeed')
  getHomeFeed(
    @Req() request: ViewTubeRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ): Promise<HomeFeedDto> {
    return this.homepageService.getHomeFeed(request, reply);
  }
}
