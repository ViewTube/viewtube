import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Header, Param, Query, Res, UseInterceptors } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { ChannelsService } from './channels.service';
import { ChannelInfoErrorDto } from './dto/channel-info-error.dto';
import { ChannelCommunityPostsContinuationDto } from './dto/response/channel-community-posts-continuation.dto';
import { ChannelCommunityPostsDto } from './dto/response/channel-community-posts.dto';
import { ChannelHomeDto } from './dto/response/channel-home.dto';
import { ChannelInfoDto } from './dto/response/channel-info.dto';
import { ChannelPlaylistsContinuationDto } from './dto/response/channel-playlists-continuation.dto';
import { ChannelPlaylistsDto } from './dto/response/channel-playlists.dto';
import { ChannelSearchContinuationDto } from './dto/response/channel-search-continuation.dto';
import { ChannelSearchDto } from './dto/response/channel-search.dto';
import { ChannelStatsDto } from './dto/response/channel-stats.dto';
import { ChannelVideosContinuationDto } from './dto/response/channel-videos-continuation.dto';
import { ChannelVideosDto } from './dto/response/channel-videos.dto';
import { RelatedChannelsContinuationDto } from './dto/response/related-channels-continuation.dto';

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
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelInfo(@Param('id') channelId: string): Promise<ChannelInfoDto> {
    return this.channelsService.getChannelInfo(channelId) as Promise<ChannelInfoDto>;
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get(':id/home')
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelHome(@Param('id') channelId: string): Promise<ChannelHomeDto> {
    return this.channelsService.getChannelHome(channelId) as Promise<ChannelHomeDto>;
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get(':id/videos')
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelVideos(
    @Param('id') channelId: string,
    @Query('sort') sortBy: 'newest' | 'oldest' | 'popular'
  ): Promise<ChannelVideosDto> {
    return this.channelsService.getChannelVideos(channelId, sortBy);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get('videos/continuation')
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelVideosContinuation(
    @Query('continuation') continuation: string
  ): Promise<ChannelVideosContinuationDto> {
    return this.channelsService.getChannelVideosContinuation(
      continuation
    ) as Promise<ChannelVideosContinuationDto>;
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get(':id/shorts')
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelShorts(
    @Param('id') channelId: string,
    @Query('sort') sortBy: 'newest'
  ): Promise<ChannelVideosDto> {
    return this.channelsService.getChannelShorts(channelId, sortBy);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get(':id/livestreams')
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelLivestreams(
    @Param('id') channelId: string,
    @Query('sort') sortBy: 'newest'
  ): Promise<ChannelVideosDto> {
    return this.channelsService.getChannelLivestreams(channelId, sortBy);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get(':id/playlists')
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelPlaylists(@Param('id') channelId: string): Promise<ChannelPlaylistsDto> {
    return this.channelsService.getChannelPlaylists(channelId);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get('playlists/continuation')
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelPlaylistsContinuation(
    @Query('continuation') continuation: string
  ): Promise<ChannelPlaylistsContinuationDto> {
    return this.channelsService.getChannelPlaylistsContinuation(continuation);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get(':id/search')
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  searchChannel(
    @Param('id') channelId: string,
    @Query('query') query: string
  ): Promise<ChannelSearchDto | ChannelInfoErrorDto> {
    return this.channelsService.searchChannel(channelId, query);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get('search/continuation')
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  searchChannelContinuation(
    @Query('continuation') continuation: string
  ): Promise<ChannelSearchContinuationDto> {
    return this.channelsService.searchChannelContinuation(continuation);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get('relatedchannels/continuation')
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getRelatedChannelsContinuation(
    @Query('continuation') continuation: string
  ): Promise<RelatedChannelsContinuationDto> {
    return this.channelsService.getRelatedChannelsContinuation(continuation);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get(':id/communityposts')
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelCommunityPosts(@Param('id') channelId: string): Promise<ChannelCommunityPostsDto> {
    return this.channelsService.getChannelCommunityPosts(channelId);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get('communityposts/continuation')
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelCommunityPostsContinuation(
    @Query('continuation') continuation: string,
    @Query('innertube') innerTubeApi: string
  ): Promise<ChannelCommunityPostsContinuationDto> {
    return this.channelsService.getChannelCommunityPostsContinuation(continuation, innerTubeApi);
  }

  @Header('Cache-Control', 'public, max-age=3600')
  @Get(':id/stats')
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getChannelStats(@Param('id') channelId: string): Promise<ChannelStatsDto> {
    return this.channelsService.getChannelStats(channelId) as Promise<ChannelStatsDto>;
  }
}
