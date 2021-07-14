import {
  Controller,
  UseGuards,
  Req,
  Get,
  Query,
  Post,
  Param,
  Body,
  Delete,
  InternalServerErrorException,
  CacheInterceptor,
  UseInterceptors,
  CacheTTL
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'server/auth/guards/jwt.guard';
import { VideoVisitDetailsDto } from './dto/video-visit-details.dto';
import { VideoVisitDto } from './dto/video-visit.dto';
import { HistoryService } from './history.service';

@ApiTags('User')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UseInterceptors(CacheInterceptor)
@Controller('user/history')
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Get()
  @CacheTTL(300)
  getHistory(
    @Req() request: any,
    @Query('limit') limit: number = 30,
    @Query('start') start: number = 0,
    @Query('sort') sortString: 'ASC' | 'DESC' = 'ASC',
    @Query('filter') filter: string = ''
  ): Promise<{ videos: Array<VideoVisitDetailsDto>; videoCount: number }> {
    return this.historyService.getHistory(request.user.username, limit, start, sortString, filter);
  }

  @Post(':id')
  setVideoVisit(
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

  @Get(':id')
  @CacheTTL(0)
  getVideoVisit(@Req() request: any, @Param('id') videoId: string): Promise<VideoVisitDto> {
    return this.historyService.getVideoVisit(request.user.username, videoId);
  }

  @Delete()
  async deleteEntireHistory(@Req() request: any): Promise<void> {
    const result = await this.historyService.deleteCompleteHistory(request.user.username);
    if (!result.success) {
      throw new InternalServerErrorException('Error deleting history');
    }
  }

  @Delete(':videoId')
  deleteHistoryEntry(@Req() request: any, @Param('videoId') videoId: string): Promise<void> {
    return this.historyService.deleteHistoryEntry(request.user.username, videoId);
  }

  @Delete('from/:startDate/to/:endDate')
  deleteHistoryRange(
    @Req() request: any,
    @Param('startDate') startDate: string,
    @Param('endDate') endDate: string
  ): Promise<void> {
    return this.historyService.deleteHistoryRange(request.user.username, startDate, endDate);
  }
}
