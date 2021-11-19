/* eslint-disable  @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Put,
  Param,
  Delete,
  Req,
  UseGuards,
  Post,
  Body,
  Query
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import Consola from 'consola';
import { JwtAuthGuard } from 'server/auth/guards/jwt.guard';
import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';
import { ChannelBasicInfoDto } from 'server/core/channels/dto/channel-basic-info.dto';
import { Common } from 'server/core/common';
import { ViewTubeRequest } from 'server/common/viewtube-request';
import { SubscriptionStatusDto } from './dto/subscription-status.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('User')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('user/subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get('channels')
  @ApiQuery({ name: 'limit', required: false, example: 30 })
  @ApiQuery({ name: 'start', required: false, example: 0 })
  @ApiQuery({
    name: 'sort',
    type: String,
    example: 'author:1,authorVerified:-1',
    required: false
  })
  @ApiQuery({
    name: 'filter',
    type: String,
    example: 'linu',
    required: false
  })
  getSubscribedChannels(
    @Req() request: ViewTubeRequest,
    @Query('limit') limit = 30,
    @Query('start') start = 0,
    @Query('sort') sort = '',
    @Query('filter') filter = ''
  ): Promise<{ channels: Array<ChannelBasicInfoDto>; channelCount: number } | void> {
    const sortObj = Common.convertSortParams<ChannelBasicInfoDto>(sort);
    return this.subscriptionsService.getSubscribedChannels(
      request.user.username,
      limit,
      start,
      sortObj,
      filter
    );
  }

  @Get('videos')
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'start', required: false })
  async getSubscriptionVideos(
    @Req() request: ViewTubeRequest,
    @Query('limit') limit = 30,
    @Query('start') start = 0
  ): Promise<{ videoCount: number; videos: Array<VideoBasicInfoDto> }> {
    let feed = null;
    try {
      feed = await this.subscriptionsService.getSubscriptionFeed(
        request.user.username,
        limit,
        start
      );
    } catch (error) {
      Consola.error(error);
    }
    return feed;
  }

  @Get(':channelId')
  getSubscription(
    @Req() request: ViewTubeRequest,
    @Param('channelId') channelId: string
  ): Promise<SubscriptionStatusDto> {
    return this.subscriptionsService.getSubscription(request.user.username, channelId);
  }

  @Put(':channelId')
  createSubscription(
    @Req() request: ViewTubeRequest,
    @Param('channelId') channelId: string
  ): Promise<SubscriptionStatusDto> {
    return this.subscriptionsService.subscribeToChannel(request.user.username, channelId);
  }

  @Post('multiple')
  createMultipleSubscriptions(
    @Req() request: ViewTubeRequest,
    @Body('channels') channels: Array<string>
  ): Promise<{
    successful: Array<SubscriptionStatusDto>;
    failed: Array<SubscriptionStatusDto>;
    existing: Array<SubscriptionStatusDto>;
  }> {
    return this.subscriptionsService.subscribeToMultipleChannels(request.user.username, channels);
  }

  @Delete(':channelId')
  deleteSubscription(
    @Req() request: ViewTubeRequest,
    @Param('channelId') channelId: string
  ): Promise<SubscriptionStatusDto> {
    return this.subscriptionsService.unsubscribeFromChannel(request.user.username, channelId);
  }
}
