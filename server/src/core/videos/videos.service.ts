import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import sharp from 'sharp';
import {
  Injectable,
  HttpException,
  ForbiddenException,
  InternalServerErrorException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DislikeDto } from 'server/core/videos/dto/dislike.dto';
import { BlockedVideo } from 'server/admin/schemas/blocked-video';
import { innertubeClient } from 'server/common/innertube/innertube';
import { toVTVideoInfoDto } from 'server/mapper/converter/video-info/vt-video-info.converter';
import { VTVideoInfoDto } from 'server/mapper/dto/vt-video-info.dto';
import { vtFetch } from 'server/common/vtFetch';
import { VideoBasicInfo } from './schemas/video-basic-info.schema';
import { VideoBasicInfoDto } from './dto/video-basic-info.dto';

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(BlockedVideo.name)
    private readonly blockedVideoModel: Model<BlockedVideo>,
    @InjectModel(VideoBasicInfo.name)
    private readonly VideoBasicInfoModel: Model<VideoBasicInfo>
  ) {}

  returnYoutubeDislikeUrl = 'https://returnyoutubedislikeapi.com';

  async getDash(id: string): Promise<string> {
    const isVideoBlocked = await this.blockedVideoModel.findOne({ videoId: id });
    if (isVideoBlocked) {
      throw new ForbiddenException('This video has been blocked for copyright reasons.');
    }

    try {
      const client = await innertubeClient();
      const videoInfo = await client.getBasicInfo(id);

      const dashManifest = await videoInfo.toDash((url: URL) => {
        url.searchParams.append('__host', url.host);
        return url;
      });

      return dashManifest;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getById(id: string): Promise<VTVideoInfoDto> {
    const isVideoBlocked = await this.blockedVideoModel.findOne({ videoId: id });
    if (isVideoBlocked) {
      throw new ForbiddenException('This video has been blocked for copyright reasons.');
    }

    try {
      const client = await innertubeClient();
      const videoInfo = await client.getInfo(id);

      const dashManifest = await videoInfo.toDash((url: URL) => {
        url.searchParams.append('__host', url.host);
        return url;
      });

      const video = toVTVideoInfoDto(videoInfo as unknown, {
        dashManifest
      });

      const videoBasicInfo: VideoBasicInfoDto = {
        author: video.author.name,
        authorId: video.author.id,
        authorThumbnails: video.author.thumbnails,
        authorThumbnailUrl: video.author.thumbnails[0].url,
        authorVerified: video.author.isVerified,
        description: video.description,
        likeCount: video.likeCount,
        lengthSeconds: video.duration.seconds,
        lengthString: video.duration.text,
        publishedText: video.published.text,
        published: video.published.date.getTime(),
        title: video.title,
        videoId: video.id,
        videoThumbnails: video.thumbnails,
        viewCount: video.viewCount,
        live: video.live
      };
      await this.VideoBasicInfoModel.findOneAndUpdate({ videoId: id }, videoBasicInfo, {
        upsert: true
      }).exec();

      return video;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getDislikes(id: string): Promise<DislikeDto> {
    const { body } = await vtFetch(`${this.returnYoutubeDislikeUrl}/Votes?videoId=${id}`);

    if (body) {
      const responseObject = (await body.json()) as DislikeDto & { status?: number };
      if (!isNaN(responseObject.dislikes)) {
        return responseObject;
      } else if (responseObject.status) {
        throw new HttpException(responseObject, responseObject.status);
      }
    }

    throw new HttpException('Error fetching dislike information', 503);
  }

  async saveAuthorImage(imgUrl: string, channelId: string) {
    const arrBufferResponse = await vtFetch(imgUrl);
    const arrBuffer = await arrBufferResponse.body.arrayBuffer();

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
