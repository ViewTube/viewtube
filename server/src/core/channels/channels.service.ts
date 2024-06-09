import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FastifyReply } from 'fastify';
import fs from 'fs';
import { Model } from 'mongoose';
import path from 'path';
import { General } from 'server/common/general.schema';
import sharp from 'sharp';
import { checkParams, throwChannelError } from './channels.helper';
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
import { SortType } from './types/sort';
import { YoutubeGrabber } from './yt-channel-info';
import { ChannelInfoError } from './yt-channel-info/app/types';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(General.name)
    private readonly GeneralModel: Model<General>
  ) {}

  async getChannelHome(channelId: string): Promise<ChannelHomeDto | ChannelInfoError> {
    if (!checkParams(channelId)) {
      throw new BadRequestException('Error fetching channel homepage', 'Invalid channelId');
    }
    // try {
    return (await YoutubeGrabber.getChannelHome({ channelId })) as unknown as Promise<
      ChannelHomeDto | ChannelInfoError
    >;
    // } catch (error) {
    //   throwChannelError(error, 'Error fetching channel homepage');
    // }
  }

  getChannelInfo(channelId: string): Promise<ChannelInfoDto | ChannelInfoError> {
    if (!checkParams(channelId)) {
      throw new BadRequestException('Error fetching channel info', 'Invalid channelId');
    }
    try {
      return YoutubeGrabber.getChannelInfo({ channelId }) as unknown as Promise<ChannelInfoDto>;
    } catch (error) {
      throwChannelError(error, 'Error fetching channel info');
    }
  }

  async getChannelVideos(
    channelId: string,
    sort: SortType = 'newest'
  ): Promise<ChannelVideosDto | ChannelInfoError> {
    if (!checkParams(channelId, sort)) {
      throw new BadRequestException(
        'Error fetching channel videos',
        'Invalid channelId or sort parameter'
      );
    }
    try {
      return YoutubeGrabber.getChannelVideos({ channelId, sortBy: sort });
    } catch (error) {
      throwChannelError(error, 'Error fetching channel videos');
    }
  }

  getChannelVideosContinuation(
    continuation: string
  ): Promise<ChannelVideosContinuationDto | ChannelInfoError> {
    if (!checkParams(continuation)) {
      throw new BadRequestException('Error fetching channel videos', 'Invalid continuation string');
    }
    try {
      return YoutubeGrabber.getChannelVideosMore({ continuation });
    } catch (error) {
      throwChannelError(error, 'Error fetching channel videos');
    }
  }

  async getChannelShorts(
    channelId: string,
    sort = 'newest' as const
  ): Promise<ChannelVideosDto | ChannelInfoError> {
    if (!checkParams(channelId)) {
      throw new BadRequestException('Error fetching channel shorts', 'Invalid channelId');
    }
    try {
      return YoutubeGrabber.getChannelShorts({ channelId, sortBy: sort });
    } catch (error) {
      throwChannelError(error, 'Error fetching channel shorts');
    }
  }

  async getChannelLivestreams(
    channelId: string,
    sort = 'newest' as const
  ): Promise<ChannelVideosDto> {
    if (!checkParams(channelId)) {
      throw new BadRequestException('Error fetching channel livestreams', 'Invalid channelId');
    }
    try {
      return YoutubeGrabber.getChannelLivestreams({ channelId, sortBy: sort });
    } catch (error) {
      throwChannelError(error, 'Error fetching channel livestreams');
    }
  }

  getChannelPlaylists(channelId: string): Promise<ChannelPlaylistsDto> {
    if (!checkParams(channelId)) {
      throw new BadRequestException('Error fetching channel playlists', 'Invalid channelId');
    }
    try {
      return YoutubeGrabber.getChannelPlaylistInfo({ channelId });
    } catch (error) {
      throwChannelError(error, 'Error fetching channel playlists');
    }
  }

  getChannelPlaylistsContinuation(continuation: string): Promise<ChannelPlaylistsContinuationDto> {
    if (!checkParams(continuation)) {
      throw new BadRequestException(
        'Error fetching channel playlists',
        'Invalid continuation string'
      );
    }
    try {
      return YoutubeGrabber.getChannelPlaylistsMore({ continuation });
    } catch (error) {
      throwChannelError(error, 'Error fetching channel playlists');
    }
  }

  searchChannel(channelId: string, query: string): Promise<ChannelSearchDto | ChannelInfoError> {
    if (!checkParams(channelId, query)) {
      throw new BadRequestException(
        'Error fetching channel channel search',
        'Invalid channelId or query'
      );
    }
    try {
      return YoutubeGrabber.searchChannel({ channelId, query });
    } catch (error) {
      throwChannelError(error, 'Error fetching channel channel search');
    }
  }

  searchChannelContinuation(continuation: string): Promise<ChannelSearchContinuationDto> {
    if (!checkParams(continuation)) {
      throw new BadRequestException('Error fetching channel search', 'Invalid continuation string');
    }
    try {
      return YoutubeGrabber.searchChannelMore({ continuation });
    } catch (error) {
      throwChannelError(error, 'Error fetching channel search');
    }
  }

  async getRelatedChannelsContinuation(
    continuation: string
  ): Promise<RelatedChannelsContinuationDto> {
    if (!checkParams(continuation)) {
      throw new BadRequestException(
        'Error fetching related channels',
        'Invalid continuation string'
      );
    }
    try {
      const relatedChannelsContinuation = await YoutubeGrabber.getRelatedChannelsMore({
        continuation
      });
      return {
        continuation: relatedChannelsContinuation.continuation,
        items: relatedChannelsContinuation.items.map(item => {
          return {
            channelId: item.authorId,
            channelName: item.author,
            channelUrl: item.authorUrl,
            thumbnail: item.authorThumbnails
          };
        })
      };
    } catch (error) {
      throwChannelError(error, 'Error fetching related channels');
    }
  }

  getChannelCommunityPosts(channelId: string): Promise<ChannelCommunityPostsDto> {
    if (!checkParams(channelId)) {
      throw new BadRequestException('Error fetching channel community posts', 'Invalid channelId');
    }
    try {
      return YoutubeGrabber.getChannelCommunityPosts({
        channelId
      }) as Promise<ChannelCommunityPostsDto>;
    } catch (error) {
      throwChannelError(error, 'Error fetching channel community posts');
    }
  }

  getChannelCommunityPostsContinuation(
    continuation: string,
    innerTubeApi: string
  ): Promise<ChannelCommunityPostsContinuationDto> {
    if (!checkParams(continuation)) {
      throw new BadRequestException(
        'Error fetching channel community posts',
        'Invalid continuation string'
      );
    }
    try {
      return YoutubeGrabber.getChannelCommunityPostsMore({
        continuation,
        innerTubeApi
      }) as Promise<ChannelCommunityPostsDto>;
    } catch (error) {
      throwChannelError(error, 'Error fetching channel community posts');
    }
  }

  getChannelStats(channelId: string): Promise<ChannelStatsDto | ChannelInfoError> {
    if (!checkParams(channelId)) {
      throw new BadRequestException('Error fetching channel stats', 'Invalid channelId');
    }
    try {
      return YoutubeGrabber.getChannelStats({ channelId });
    } catch (error) {
      throwChannelError(error, 'Error fetching channel stats');
    }
  }

  getTinyThumbnail(reply: FastifyReply, id: string): void {
    const imgPathWebp = path.join(global.__basedir, `channels/${id}.webp`);

    const imgPathJpg = path.join(global.__basedir, `channels/${id}.jpg`);

    const imageTransformer = sharp().resize(36, 36);

    try {
      const fileStream = fs.createReadStream(imgPathWebp);
      reply.type('image/webp').send(fileStream.pipe(imageTransformer));
      return;
    } catch {
      // Error is thrown later
    }

    try {
      const fileStream = fs.createReadStream(imgPathJpg);
      reply.type('image/jpeg').send(fileStream.pipe(imageTransformer));
      return;
    } catch {
      // Error is thrown later
    }

    throw new NotFoundException();
  }
}
