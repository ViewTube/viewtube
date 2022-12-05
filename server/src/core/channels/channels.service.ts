import path from 'path';
import fs from 'fs';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { General } from 'server/common/general.schema';
import { FastifyReply } from 'fastify';
import sharp from 'sharp';
import ytch from 'yt-channel-info';
import { ChannelHomeDto } from './dto/response/channel-home.dto';
import { ChannelVideosDto } from './dto/response/channel-videos.dto';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(General.name)
    private readonly GeneralModel: Model<General>
  ) {}

  async getChannelHome(channelId: string): Promise<ChannelHomeDto> {
    try {
      if (typeof channelId === 'string' && channelId.length > 0) {
        const channelHome = await ytch.getChannelHome({ channelId });
        if (channelHome) {
          return channelHome;
        }
      }
      throw new InternalServerErrorException('Error fetching channel homepage');
    } catch (error) {
      const returnError = {
        message: 'Error fetching channel homepage',
        description: error?.message,
        code: error?.code,
        status: error?.response?.status
      };
      if (error?.response?.status === 404) {
        throw new NotFoundException(returnError);
      }
      throw new InternalServerErrorException(returnError);
    }
  }

  async getChannelVideos(channelId: string): Promise<ChannelVideosDto> {
    try {
      if (typeof channelId === 'string' && channelId.length > 0) {
        const channelVideos = await ytch.getChannelVideos({ channelId });
        if (channelVideos) {
          return channelVideos;
        }
      }
      throw new InternalServerErrorException('Error fetching channel videos');
    } catch (error) {
      const returnError = {
        message: 'Error fetching channel videos',
        description: error?.message,
        code: error?.code,
        status: error?.response?.status
      };
      if (error?.response?.status === 404) {
        throw new NotFoundException(returnError);
      }
      throw new InternalServerErrorException(returnError);
    }
  }

  getTinyThumbnail(reply: FastifyReply, id: string) {
    // eslint-disable-next-line dot-notation
    const imgPathWebp = path.join(global['__basedir'], `channels/${id}.webp`);
    // eslint-disable-next-line dot-notation
    const imgPathJpg = path.join(global['__basedir'], `channels/${id}.jpg`);

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
