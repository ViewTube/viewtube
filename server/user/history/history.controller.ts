import { Controller, UseGuards, Req, Get, Query, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'server/auth/guards/jwt.guard';
import { Common } from 'server/core/common';
import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { VideoVisitDetailsDto } from './dto/video-visit-details.dto';
import { HistoryService } from './history.service';

@ApiTags('User')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('user/history')
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Get()
  getSettings(
    @Req() request: any,
    @Query('limit') limit = 30,
    @Query('start') start = 0,
    @Query('sort') sortString: 'ASC' | 'DESC' = 'ASC',
    @Query('filter') filter: string = ''
  ): Promise<{ videos: Array<VideoVisitDetailsDto>; videoCount: number }> {
    return this.historyService.getHistory(request.user.username, limit, start, sortString, filter);
  }

  @Post(':id')
  addVideoVisit(
    @Req() request: any,
    @Param('id') videoId: string,
    @Body('progressSeconds') progressSeconds: number,
    @Body('lengthSeconds') lengthSeconds: number
  ) {
    const date = new Date();
    return this.historyService.setVideoVisit(
      request.user.username,
      videoId,
      progressSeconds,
      lengthSeconds,
      date
    );
  }
}
