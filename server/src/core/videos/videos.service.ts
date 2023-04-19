import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import sharp from 'sharp';
import { Injectable, HttpException, ForbiddenException } from '@nestjs/common';
import { getInfo, videoInfo } from 'ytdl-core';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChannelBasicInfo } from '../channels/schemas/channel-basic-info.schema';
import { Common } from '../common';
import { DashGenerator } from './dash.generator';
import { VideoBasicInfo } from './schemas/video-basic-info.schema';
import { DislikeDto } from 'server/core/videos/dto/dislike.dto';
import undici from 'undici';
import { BlockedVideo } from 'server/user/admin/schemas/blocked-video';
import { ofetch } from 'ofetch';
import { innertubeClient } from 'server/common/innertube/innertube';
import { toVTVideoInfoDto } from 'server/mapper/converter/video-info/vt-video-info.converter';
import sample8k from 'server/common/innertube/sample_8k.json';
import sampleLive from 'server/common/innertube/sample_livestream.json';
import sampleLive2 from 'server/common/innertube/sample_livestream2.json';
import sampleLTT from 'server/common/innertube/sample_ltt.json';
import sampleVidIQ from 'server/common/innertube/sample_vidIQ.json';

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

  async getById(id: string): Promise<any> {
    const isVideoBlocked = await this.blockedVideoModel.findOne({ videoId: id });
    if (isVideoBlocked) {
      throw new ForbiddenException('This video has been blocked for copyright reasons.');
    }

    const client = await innertubeClient;
    const videoInfo: unknown = await client.getInfo(id);
    const video = toVTVideoInfoDto(videoInfo);

    return video;
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
