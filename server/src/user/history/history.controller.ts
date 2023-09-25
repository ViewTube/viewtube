import {
  Controller,
  Req,
  Get,
  Query,
  Post,
  Param,
  Body,
  Delete,
  InternalServerErrorException
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ViewTubeRequest } from 'server/common/viewtube-request';
import { HistoryResponseDto } from './dto/history-response.dto';
import { VideoVisitDto } from './dto/video-visit.dto';
import { HistoryService } from './history.service';
import { Private } from 'server/auth/decorators/private.decorator';

@ApiTags('User')
@ApiBearerAuth()
@Private()
@Controller('user/history')
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Get()
  getHistory(
    @Req() request: ViewTubeRequest,
    @Query('limit') limit = 30,
    @Query('start') start = 0,
    @Query('sort') sortString: 'ASC' | 'DESC' = 'ASC',
    @Query('filter') filter = ''
  ): Promise<HistoryResponseDto> {
    return this.historyService.getHistory(request.user.username, limit, start, sortString, filter);
  }

  @Post(':id')
  setVideoVisit(
    @Req() request: ViewTubeRequest,
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

  @Get(':id')
  getVideoVisit(
    @Req() request: ViewTubeRequest,
    @Param('id') videoId: string
  ): Promise<VideoVisitDto> {
    return this.historyService.getVideoVisit(request.user.username, videoId);
  }

  @Delete()
  async deleteEntireHistory(@Req() request: ViewTubeRequest): Promise<void> {
    const result = await this.historyService.deleteCompleteHistory(request.user.username);
    if (!result.success) {
      throw new InternalServerErrorException('Error deleting history');
    }
  }

  @Delete(':videoId')
  deleteHistoryEntry(
    @Req() request: ViewTubeRequest,
    @Param('videoId') videoId: string
  ): Promise<void> {
    return this.historyService.deleteHistoryEntry(request.user.username, videoId);
  }

  @Delete('from/:startDate/to/:endDate')
  deleteHistoryRange(
    @Req() request: ViewTubeRequest,
    @Param('startDate') startDate: string,
    @Param('endDate') endDate: string
  ): Promise<void> {
    return this.historyService.deleteHistoryRange(request.user.username, startDate, endDate);
  }
}
