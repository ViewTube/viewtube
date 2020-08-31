import { Controller, Get, Put, Param, Delete, Req, UseGuards, Query, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionStatusDto } from './dto/subscription-status.dto';
import { JwtAuthGuard } from 'server/auth/guards/jwt.guard';
import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';
import { ChannelBasicInfoDto } from 'server/core/channels/dto/channel-basic-info.dto';
import { Sorting } from 'server/common/sorting.type';

@ApiTags('User')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('user/subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) { }

  @Get('channels')
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'start', required: false })
  @ApiQuery({ name: 'sort', type: Object, example: '{ "sort": { "author": "ASC", "authorVerified": "DESC" } }', required: false })
  async getSubscribedChannels(
    @Req() req: any,
    @Query('limit') limit = 30,
    @Query('start') start = 0,
    @Query('sort') sort: Sorting<ChannelBasicInfoDto> = {}
  ): Promise<Array<ChannelBasicInfoDto> | void> {
    return this.subscriptionsService.getSubscribedChannels(req.user.username, limit, start, sort);
  }

  @Get('videos')
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'start', required: false })
  async getSubscriptionVideos(
    @Req() req: any,
    @Query('limit') limit = 30,
    @Query('start') start = 0
  ): Promise<Array<VideoBasicInfoDto>> {
    return this.subscriptionsService.getSubscriptionFeed(req.user.username, limit, start);
  }

  @Get(':channelId')
  async getSubscription(@Req() req: any, @Param('channelId') channelId: string): Promise<SubscriptionStatusDto> {
    return this.subscriptionsService.getSubscription(req.user.username, channelId);
  }

  @Put(':channelId')
  async createSubscription(@Req() req: any, @Param('channelId') channelId: string): Promise<SubscriptionStatusDto> {
    return this.subscriptionsService.subscribeToChannel(req.user.username, channelId);
  }

  @Post('multiple')
  async createMultipleSubscriptions(@Req() req: any, @Body('channels') channels: Array<string>):
    Promise<{
      successful: Array<SubscriptionStatusDto>;
      failed: Array<SubscriptionStatusDto>;
      existing: Array<SubscriptionStatusDto>;
    }> {
    console.log(channels);
    return this.subscriptionsService.subscribeToMultipleChannels(req.user.username, channels);
  }

  @Delete(':channelId')
  async deleteSubscription(@Req() req: any, @Param('channelId') channelId: string): Promise<SubscriptionStatusDto> {
    return this.subscriptionsService.unsubscribeFromChannel(req.user.username, channelId);
  }
}
