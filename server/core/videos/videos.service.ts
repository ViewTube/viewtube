import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { VideoDto } from './dto/video.dto';
import { VideoEntity } from './video.entity';
import { Common } from '../common';
import { getBasicInfo, videoInfo, downloadOptions } from 'ytdl-core';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { VideoBasicInfo } from './schemas/video-basic-info.schema';
import { Model } from 'mongoose';
import { ChannelBasicInfo } from '../channels/schemas/channel-basic-info.schema';
import { VideoBasicInfoDto } from './dto/video-basic-info.dto';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { promisify } from 'util';
import { ChannelBasicInfoDto } from '../channels/dto/channel-basic-info.dto';
import HttpsProxyAgent from "https-proxy-agent";

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(VideoBasicInfo.name) private readonly videoModel: Model<VideoBasicInfo>,
    @InjectModel(ChannelBasicInfo.name) private readonly channelModel: Model<ChannelBasicInfo>,
    private configService: ConfigService
  ) { }

  async getById(id: string): Promise<VideoDto> {
    const url: string = Common.youtubeVideoUrl + id;
    // const proxy = '51.38.118.168:3128';
    // const agent = HttpsProxyAgent(proxy);
    const ytdlOptions: downloadOptions = {
      requestOptions: {}
    };
    if (this.configService.get('VIEWTUBE_YOUTUBE_COOKIE')) {
      ytdlOptions.requestOptions['cookie'] = this.configService.get('VIEWTUBE_YOUTUBE_COOKIE');
      if (this.configService.get('VIEWTUBE_YOUTUBE_IDENTIFIER')) {
        ytdlOptions.requestOptions['x-youtube-identity-token'] = this.configService.get('VIEWTUBE_YOUTUBE_IDENTIFIER');
      }
    }
    console.log(ytdlOptions);
    try {
      const result: videoInfo = await getBasicInfo(url, ytdlOptions);
      const video: VideoDto = new VideoEntity(result);


      const channelBasicInfo: ChannelBasicInfoDto = {
        authorId: video.authorId,
        author: video.author,
        authorThumbnails: video.authorThumbnails,
        authorVerified: video.authorVerified
      }

      const authorImageUrl = await this.saveAuthorImage(video.authorThumbnails[2].url, video.authorId);
      if (authorImageUrl) {
        channelBasicInfo.authorThumbnailUrl = authorImageUrl;
      }

      const videoBasicInfo: VideoBasicInfoDto = {
        author: video.author,
        authorId: video.authorId,
        description: video.description,
        dislikeCount: video.dislikeCount,
        likeCount: video.likeCount,
        published: video.published,
        publishedText: video.publishedText,
        title: video.title,
        videoId: video.videoId,
        videoThumbnails: video.videoThumbnails,
        viewCount: video.viewCount,
        lengthSeconds: video.lengthSeconds
      }

      this.channelModel.findOneAndUpdate({ authorId: video.authorId, }, channelBasicInfo, { upsert: true }).exec().catch(console.log);
      this.videoModel.findOneAndUpdate({ videoId: video.videoId, }, videoBasicInfo, { upsert: true }).exec().catch(console.log);

      return video;
    } catch (err) {
      console.error(err);
      throw new HttpException(
        err.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async saveAuthorImage(imgUrl: string, channelId: string) {
    const arrBuffer = await fetch(imgUrl, { method: 'GET' })
      .then(response => response.arrayBuffer())
      .catch(console.log);

    if (arrBuffer) {
      const imgPath = path.join(global['__basedir'], `channels/${channelId}.jpg`);
      const appendFile = promisify(fs.appendFile);

      try {
        await appendFile(imgPath, Buffer.from(arrBuffer));
      } catch (err) {
        console.log(err);
        return null;
      }
      return `channels/${channelId}/thumbnail/tiny.jpg`;
    }
  }
}
