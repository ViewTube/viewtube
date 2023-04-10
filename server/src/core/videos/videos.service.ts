import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import sharp from 'sharp';
import { Injectable, HttpException, HttpStatus, ForbiddenException } from '@nestjs/common';
import { getInfo, videoInfo, getInfoOptions } from 'ytdl-core';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import HttpsProxyAgent from 'https-proxy-agent';
import HttpsProxyAgentType from 'https-proxy-agent/dist/agent';
import { VideoDto } from 'server/core/videos/dto/video.dto';
import { ChannelBasicInfo } from '../channels/schemas/channel-basic-info.schema';
import { Common } from '../common';
import { DashGenerator } from './dash.generator';
import { VideoBasicInfo } from './schemas/video-basic-info.schema';
import { mapVideo } from './video.mapper';
import { DislikeDto } from 'server/core/videos/dto/dislike.dto';
import undici from 'undici';
import { BlockedVideo } from 'server/user/admin/schemas/blocked-video';
import { ofetch } from 'ofetch';

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(VideoBasicInfo.name)
    private readonly videoModel: Model<VideoBasicInfo>,
    @InjectModel(ChannelBasicInfo.name)
    private readonly channelModel: Model<ChannelBasicInfo>,
    @InjectModel(BlockedVideo.name)
    private readonly blockedVideoModel: Model<BlockedVideo>,
    private configService: ConfigService
  ) {}

  returnYoutubeDislikeUrl = 'https://returnyoutubedislikeapi.com';

  async getById(id: string): Promise<VideoDto> {
    const isVideoBlocked = await this.blockedVideoModel.findOne({ videoId: id });
    if (isVideoBlocked) {
      throw new ForbiddenException('This video has been blocked for copyright reasons.');
    }
    const url: string = Common.youtubeVideoUrl + id;
    let proxyAgent: HttpsProxyAgentType;

    if (this.configService.get('VIEWTUBE_PROXY_URL')) {
      const proxy = this.configService.get('VIEWTUBE_PROXY_URL');
      proxyAgent = HttpsProxyAgent(proxy);
    }
    const ytdlOptions: getInfoOptions = {
      requestOptions: {}
    };
    if (this.configService.get('VIEWTUBE_YOUTUBE_COOKIE')) {
      (ytdlOptions.requestOptions as any).cookie =
        this.configService.get('VIEWTUBE_YOUTUBE_COOKIE');
      if (this.configService.get('VIEWTUBE_YOUTUBE_IDENTIFIER')) {
        ytdlOptions.requestOptions['x-youtube-identity-token'] = this.configService.get(
          'VIEWTUBE_YOUTUBE_IDENTIFIER'
        );
      }
    }
    if (proxyAgent) {
      (ytdlOptions.requestOptions as any).agent = proxyAgent;
    }

    try {
      const result: videoInfo = await getInfo(url, ytdlOptions);

      // const dashManifest = DashGenerator.generateDashFileFromFormats(
      //   result.formats,
      //   result.videoDetails.lengthSeconds
      // );

      const video: VideoDto = mapVideo(result);

      // const channelBasicInfo: ChannelBasicInfoDto = {
      //   authorId: video.authorId,
      //   author: video.author,
      //   authorThumbnails: video.authorThumbnails,
      //   authorVerified: video.authorVerified
      // };

      // const authorImageUrl = await this.saveAuthorImage(
      //   video.authorThumbnails[2].url,
      //   video.authorId
      // );
      // if (authorImageUrl) {
      //   channelBasicInfo.authorThumbnailUrl = authorImageUrl;
      // }

      // const videoBasicInfo: VideoBasicInfoDto = {
      //   author: video.author,
      //   authorId: video.authorId,
      //   description: video.description,
      //   dislikeCount: video.dislikeCount,
      //   likeCount: video.likeCount,
      //   published: video.published,
      //   publishedText: video.publishedText,
      //   title: video.title,
      //   videoId: video.videoId,
      //   videoThumbnails: video.videoThumbnails,
      //   viewCount: video.viewCount,
      //   lengthSeconds: video.lengthSeconds
      // };

      // this.channelModel
      //   .findOneAndUpdate({ authorId: video.authorId }, channelBasicInfo, { upsert: true })
      //   .exec()
      // this.videoModel
      //   .findOneAndUpdate({ videoId: video.videoId }, videoBasicInfo, { upsert: true })
      //   .exec()

      return video;
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: err.address && err.code ? err : err.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getDislikes(id: string): Promise<DislikeDto> {
    const { body } = await undici.request(`${this.returnYoutubeDislikeUrl}/Votes?videoId=${id}`);

    if (body) {
      const responseObject = await body.json();
      if (!isNaN(responseObject.dislikes)) {
        return responseObject;
      } else if (responseObject.status) {
        throw new HttpException(responseObject, responseObject.status);
      }
    }

    throw new HttpException('Error fetching dislike information', 503);
  }

  async getDashManifest(id: string): Promise<string> {
    const url: string = Common.youtubeVideoUrl + id;
    const result: videoInfo = await getInfo(url);

    const dashManifest = DashGenerator.generateDashFileFromFormats(
      result.player_response.streamingData.adaptiveFormats,
      result.videoDetails.lengthSeconds
    );
    return dashManifest;
  }

  async saveAuthorImage(imgUrl: string, channelId: string) {
    const arrBuffer = await ofetch(imgUrl, { method: 'GET' })
      .then(response => response.arrayBuffer())
      .catch(_ => {
        // Drop errors
      });

    if (arrBuffer) {
      try {
        const imgPath = path.join(global.__basedir, `channels/${channelId}.webp`);
        const appendFile = promisify(fs.appendFile);

        const imgBuffer = Buffer.from(arrBuffer);

        let success = true;

        const webpImage = await sharp(imgBuffer)
          .resize(36)
          .webp()
          .toBuffer()
          .catch(() => {
            success = false;
          });

        if (success && webpImage) {
          await appendFile(imgPath, webpImage);
          return `channels/${channelId}/thumbnail/tiny.webp`;
        }
        return null;
      } catch {
        return null;
      }
    }
  }
}
