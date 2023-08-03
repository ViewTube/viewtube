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
import undici from 'undici';
import { BlockedVideo } from 'server/user/admin/schemas/blocked-video';
import { ofetch } from 'ofetch';
import { innertubeClient } from 'server/common/innertube/innertube';
import { toVTVideoInfoDto } from 'server/mapper/converter/video-info/vt-video-info.converter';
import { VTVideoInfoDto } from 'server/mapper/dto/vt-video-info.dto';
// import { HttpsProxyAgent } from 'https-proxy-agent';

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(BlockedVideo.name)
    private readonly blockedVideoModel: Model<BlockedVideo>
  ) {}

  returnYoutubeDislikeUrl = 'https://returnyoutubedislikeapi.com';

  async getDash(id: string, baseUrl?: string): Promise<string> {
    const isVideoBlocked = await this.blockedVideoModel.findOne({ videoId: id });
    if (isVideoBlocked) {
      throw new ForbiddenException('This video has been blocked for copyright reasons.');
    }

    try {
      const client = await innertubeClient;
      const videoInfo = await client.getInfo(id);

      let replaceUrl = 'http://BASEURL_TO_REPLACE.com';

      if (baseUrl) {
        replaceUrl = new URL(baseUrl).origin;
      }

      const dashManifest = await videoInfo.toDash((url: URL) => {
        const searchParams = new URLSearchParams();
        for (const [key, value] of url.searchParams) {
          searchParams.append(key, value);
        }
        searchParams.append('__host', url.host);
        return new URL(`${replaceUrl}/api/videoplayback?${searchParams.toString()}`);
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
      const client = await innertubeClient;
      const videoInfo = await client.getInfo(id);

      const dashManifest = await videoInfo.toDash((url: URL) => {
        const searchParams = new URLSearchParams();
        for (const [key, value] of url.searchParams) {
          searchParams.append(key, value);
        }
        searchParams.append('__host', url.host);
        return new URL(
          `http://BASEURL_TO_REPLACE.com/api/videoplayback?${searchParams.toString()}`
        );
      });

      const video = toVTVideoInfoDto(videoInfo as unknown, {
        dashManifest
      });
      return video;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getDislikes(id: string): Promise<DislikeDto> {
    const { body } = await undici.request(`${this.returnYoutubeDislikeUrl}/Votes?videoId=${id}`);

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
