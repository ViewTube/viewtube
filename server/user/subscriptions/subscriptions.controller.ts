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
import { JwtAuthGuard } from 'server/auth/guards/jwt.guard';
import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';
import { ChannelBasicInfoDto } from 'server/core/channels/dto/channel-basic-info.dto';
import { Common } from 'server/core/common';
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
  getSubscribedChannels(
    @Req() req: any,
    @Query('limit') limit = 30,
    @Query('start') start = 0,
    @Query('sort') sort: string = ''
  ): Promise<{ channels: Array<ChannelBasicInfoDto>; channelCount: number } | void> {
    const sortObj = Common.convertSortParams<ChannelBasicInfoDto>(sort);
    return this.subscriptionsService.getSubscribedChannels(
      req.user.username,
      limit,
      start,
      sortObj
    );
  }

  @Get('videos')
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'start', required: false })
  getSubscriptionVideos(
    @Req() req: any,
    @Query('limit') limit = 30,
    @Query('start') start = 0
  ): Promise<{ videoCount: number; videos: Array<VideoBasicInfoDto> }> {
    return this.subscriptionsService.getSubscriptionFeed(req.user.username, limit, start);
  }

  @Get(':channelId')
  getSubscription(
    @Req() req: any,
    @Param('channelId') channelId: string
  ): Promise<SubscriptionStatusDto> {
    return this.subscriptionsService.getSubscription(req.user.username, channelId);
  }

  @Put(':channelId')
  createSubscription(
    @Req() req: any,
    @Param('channelId') channelId: string
  ): Promise<SubscriptionStatusDto> {
    return this.subscriptionsService.subscribeToChannel(req.user.username, channelId);
  }

  @Post('multiple')
  createMultipleSubscriptions(
    @Req() req: any,
    @Body('channels') channels: Array<string>
  ): Promise<{
    successful: Array<SubscriptionStatusDto>;
    failed: Array<SubscriptionStatusDto>;
    existing: Array<SubscriptionStatusDto>;
  }> {
    console.log(channels);
    return this.subscriptionsService.subscribeToMultipleChannels(req.user.username, channels);
  }

  @Delete(':channelId')
  deleteSubscription(
    @Req() req: any,
    @Param('channelId') channelId: string
  ): Promise<SubscriptionStatusDto> {
    return this.subscriptionsService.unsubscribeFromChannel(req.user.username, channelId);
  }
}
