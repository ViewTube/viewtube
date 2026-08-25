import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Header, Param, Query, Res, UseInterceptors } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { VTChannelAboutDto } from 'server/mapper/dto/channel/vt-channel-about.dto';
import { VTChannelFeedDto } from 'server/mapper/dto/channel/vt-channel-feed.dto';
import { VTChannelHomeDto } from 'server/mapper/dto/channel/vt-channel-home.dto';
import { VTChannelPageDto } from 'server/mapper/dto/channel/vt-channel-page.dto';
import { VTChannelPlaylistsDto } from 'server/mapper/dto/channel/vt-channel-playlists.dto';
import { VTChannelSearchDto } from 'server/mapper/dto/channel/vt-channel-search.dto';
import { VTCommunityPostsDto } from 'server/mapper/dto/channel/vt-community-posts.dto';
import { ChannelsService } from './channels.service';
import { ChannelFeedStrategy, ContentFilterType, SortType } from './types/sort';

@ApiTags('Core')
@Controller('channels')
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Get(':id/thumbnail/tiny.jpg')
  @Header('Cache-Control', 'public, max-age=18000')
  @CacheTTL(18000000)
  getTinyThumbnailJpg(@Param('id') id: string, @Res() reply: FastifyReply): void {
    this.channelsService.getTinyThumbnail(reply, id);
  }

  @Get(':id/thumbnail/tiny.webp')
  @Header('Cache-Control', 'public, max-age=18000')
  @CacheTTL(18000000)
  getTinyThumbnailWebp(@Param('id') id: string, @Res() reply: FastifyReply): void {
    this.channelsService.getTinyThumbnail(reply, id);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelInfo(@Param('id') channelId: string): Promise<VTChannelPageDto> {
    return this.channelsService.getChannelInfo(channelId);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get(':id/home')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelHome(@Param('id') channelId: string): Promise<VTChannelHomeDto> {
    return this.channelsService.getChannelHome(channelId);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get(':id/videos')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'oldest', 'popular'] })
  @ApiQuery({ name: 'filter', required: false, enum: ['all', 'public', 'members'] })
  @ApiQuery({ name: 'strategy', required: false, enum: ['params', 'discover'] })
  getChannelVideos(
    @Param('id') channelId: string,
    @Query('sort') sort?: SortType,
    @Query('filter') filter?: ContentFilterType,
    @Query('strategy') strategy?: ChannelFeedStrategy
  ): Promise<VTChannelFeedDto> {
    return this.channelsService.getChannelVideos(channelId, sort, filter, strategy);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get(':id/shorts')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'oldest', 'popular'] })
  @ApiQuery({ name: 'strategy', required: false, enum: ['params', 'discover'] })
  getChannelShorts(
    @Param('id') channelId: string,
    @Query('sort') sort?: SortType,
    @Query('strategy') strategy?: ChannelFeedStrategy
  ): Promise<VTChannelFeedDto> {
    return this.channelsService.getChannelShorts(channelId, sort, strategy);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get(':id/livestreams')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'oldest', 'popular'] })
  @ApiQuery({ name: 'strategy', required: false, enum: ['params', 'discover'] })
  getChannelLivestreams(
    @Param('id') channelId: string,
    @Query('sort') sort?: SortType,
    @Query('strategy') strategy?: ChannelFeedStrategy
  ): Promise<VTChannelFeedDto> {
    return this.channelsService.getChannelLivestreams(channelId, sort, strategy);
  }

  /** Shared by the videos, shorts and livestreams tabs — the token carries the sort and filter. */
  @Header('Cache-Control', 'public, max-age=3600')
  @Get('videos/continuation')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelVideosContinuation(
    @Query('continuation') continuation: string
  ): Promise<VTChannelFeedDto> {
    return this.channelsService.getChannelFeedContinuation(continuation);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get(':id/playlists')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelPlaylists(@Param('id') channelId: string): Promise<VTChannelPlaylistsDto> {
    return this.channelsService.getChannelPlaylists(channelId);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get('playlists/continuation')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelPlaylistsContinuation(
    @Query('continuation') continuation: string
  ): Promise<VTChannelPlaylistsDto> {
    return this.channelsService.getChannelPlaylistsContinuation(continuation);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get(':id/search')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  searchChannel(
    @Param('id') channelId: string,
    @Query('query') query: string
  ): Promise<VTChannelSearchDto> {
    return this.channelsService.searchChannel(channelId, query);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get('search/continuation')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  searchChannelContinuation(
    @Query('continuation') continuation: string
  ): Promise<VTChannelSearchDto> {
    return this.channelsService.searchChannelContinuation(continuation);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get(':id/communityposts')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelCommunityPosts(@Param('id') channelId: string): Promise<VTCommunityPostsDto> {
    return this.channelsService.getChannelCommunityPosts(channelId);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get('communityposts/continuation')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelCommunityPostsContinuation(
    @Query('continuation') continuation: string
  ): Promise<VTCommunityPostsDto> {
    return this.channelsService.getChannelCommunityPostsContinuation(continuation);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get(':id/stats')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelStats(@Param('id') channelId: string): Promise<VTChannelAboutDto> {
    return this.channelsService.getChannelStats(channelId);
  }
}
