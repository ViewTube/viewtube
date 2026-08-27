import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { BlockedVideo } from 'server/admin/schemas/blocked-video';
import { innertubeClient } from 'server/common/innertube/innertube';
import { vtFetch } from 'server/common/vtFetch';
import { DislikeDto } from 'server/core/videos/dto/dislike.dto';
import { toVTVideoInfoDto } from 'server/mapper/converter/video-info/vt-video-info.converter';
import { VTSabrDto } from 'server/mapper/dto/vt-sabr.dto';
import { VTVideoInfoDto } from 'server/mapper/dto/vt-video-info.dto';
import sharp from 'sharp';
import type { Innertube } from 'youtubei.js';
import { Common } from '../common';
import { SponsorBlockSegmentsDto } from './dto/sponsorblock/sponsorblock-segments.dto';
import { VideoBasicInfoDto } from './dto/video-basic-info.dto';
import { buildSabrBlock } from './sabr.builder';
import { VideoBasicInfo } from './schemas/video-basic-info.schema';
import { isVideoGone, videoNotFound, videoNotPlayable, videoUpstreamFailed } from './video-errors';

/**
 * A playability status other than `OK` can leave the player response with no video data at
 * all, which youtubei.js reports by returning an object whose `basic_info` is empty rather
 * than by throwing. An upcoming premiere is not that case — it has full details and no
 * stream — so the id, not the status, is what decides.
 */
const assertPlayable = (videoInfo: {
  basic_info?: { id?: string };
  playability_status?: { status?: string; reason?: string };
}) => {
  if (videoInfo.basic_info?.id) return;
  videoNotPlayable(videoInfo.playability_status?.status, videoInfo.playability_status?.reason);
};

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(BlockedVideo.name)
    private readonly blockedVideoModel: Model<BlockedVideo>,
    @InjectModel(VideoBasicInfo.name)
    private readonly VideoBasicInfoModel: Model<VideoBasicInfo>
  ) {}

  private returnYoutubeDislikeUrl = 'https://returnyoutubedislikeapi.com';

  private sponsorBlockApiUrl = 'https://sponsor.ajay.app';

  async getDash(id: string): Promise<string> {
    const isVideoBlocked = await this.blockedVideoModel.findOne({ videoId: id });
    if (isVideoBlocked) {
      throw new ForbiddenException('This video has been blocked for copyright reasons.');
    }

    let videoInfo: Awaited<ReturnType<Innertube['getBasicInfo']>>;

    // Fetched outside the try below so that `assertPlayable`'s own explanation is not
    // swallowed by the catch and reported as a generic manifest failure.
    try {
      const client = await innertubeClient();
      videoInfo = await client.getBasicInfo(id);
    } catch (error) {
      if (isVideoGone(error)) videoNotFound();
      videoUpstreamFailed('information', error);
    }

    assertPlayable(videoInfo);

    try {
      return await videoInfo.toDash({
        url_transformer: (url: URL) => {
          url.searchParams.append('__host', url.host);
          return url;
        }
      });
    } catch (error) {
      if (isVideoGone(error)) videoNotFound();
      videoUpstreamFailed('dash manifest', error);
    }
  }

  async getById(id: string): Promise<VTVideoInfoDto> {
    const isVideoBlocked = await this.blockedVideoModel.findOne({ videoId: id });
    if (isVideoBlocked) {
      throw new ForbiddenException('This video has been blocked for copyright reasons.');
    }

    let videoInfo: Awaited<ReturnType<Innertube['getInfo']>>;
    let client: Innertube;

    try {
      client = await innertubeClient();
      videoInfo = await client.getInfo(id);
    } catch (error) {
      if (isVideoGone(error)) videoNotFound();
      videoUpstreamFailed('information', error);
    }

    assertPlayable(videoInfo);

    let dashManifest: string | null = null;
    let sabr: VTSabrDto | null = null;

    // Live has neither a manifest nor usable formats — see SABR_PLAN.md phase 7.
    if (!videoInfo.basic_info.is_live) {
      try {
        sabr = await buildSabrBlock(videoInfo, client);
      } catch {
        // Fall through to the legacy DASH path below.
      }

      if (!sabr) {
        try {
          dashManifest = await videoInfo.toDash({
            url_transformer: (url: URL) => {
              url.searchParams.append('__host', url.host);
              return url;
            }
          });
        } catch {
          // Ignore silently
        }
      }
    }

    let video: VTVideoInfoDto;

    try {
      video = toVTVideoInfoDto(videoInfo as unknown, { dashManifest, sabr });
    } catch (error) {
      videoUpstreamFailed('information', error);
    }

    const videoBasicInfo: VideoBasicInfoDto = {
      author: video.author.name,
      authorId: video.author.id,
      authorThumbnails: video.author.thumbnails,
      authorThumbnailUrl: video.author.thumbnails?.[0].url,
      authorVerified: video.author.isVerified,
      description: video.description,
      likeCount: isNaN(video.likeCount) ? 0 : video.likeCount,
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
  }

  async getDislikes(id: string): Promise<DislikeDto> {
    const { body } = await vtFetch<DislikeDto & { status?: number }>(
      `${this.returnYoutubeDislikeUrl}/Votes?videoId=${id}`
    );

    if (!body) {
      throw new BadGatewayException({
        message: 'Error fetching dislike information',
        description: 'returnyoutubedislike did not answer'
      });
    }

    const responseObject = await body.json();

    if (!isNaN(responseObject.dislikes)) {
      return responseObject;
    }

    throw new BadGatewayException({
      message: 'Error fetching dislike information',
      description: responseObject.status
        ? `returnyoutubedislike answered with ${responseObject.status}`
        : 'returnyoutubedislike answered with something unreadable'
    });
  }

  async getSkipSegments(id: string, url?: string): Promise<SponsorBlockSegmentsDto> {
    if (!id) {
      throw new BadRequestException('No video id provided');
    }

    let sponsorBlockUrl: string;

    if (url) {
      sponsorBlockUrl = decodeURIComponent(url);
      if (!Common.validateExternalUrl(sponsorBlockUrl)) {
        throw new BadRequestException('Invalid URL provided');
      }
    } else {
      sponsorBlockUrl = this.sponsorBlockApiUrl;
    }

    const idHash = createHash('sha256').update(id).digest('hex').substring(0, 4);

    const categories = [
      'sponsor',
      'selfpromo',
      'interaction',
      'intro',
      'outro',
      'preview',
      'music_offtopic',
      'filler',
      'poi_highlight'
    ];

    const { body } = await vtFetch<SponsorBlockSegmentsDto[]>(
      `${sponsorBlockUrl}/api/skipSegments/${idHash}`,
      {
        query: {
          categories: `["${categories.join('","')}"]`
        }
      }
    );

    if (!body) {
      throw new BadGatewayException({
        message: 'Error fetching skip segments',
        description: 'SponsorBlock did not answer'
      });
    }

    const skipSectionsArray = await body.json();

    if (!Array.isArray(skipSectionsArray)) {
      throw new BadGatewayException({
        message: 'Error fetching skip segments',
        description: 'SponsorBlock answered with something unreadable'
      });
    }

    const skipSections = skipSectionsArray?.find(el => el.videoID === id);

    if (skipSections) {
      return skipSections;
    }

    return {
      videoID: id,
      hash: idHash,
      segments: []
    };
  }

  async saveAuthorImage(imgUrl: string, channelId: string) {
    const arrBufferResponse = await vtFetch(imgUrl, { useProxy: true });
    const arrBuffer = await arrBufferResponse.body.arrayBuffer();

    if (!arrBuffer) {
      return;
    }
    try {
      const imgPath = path.join(global.__basedir, `channels/${channelId}.webp`);

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
        await fs.appendFile(imgPath, webpImage);
        return `channels/${channelId}/thumbnail/tiny.webp`;
      }
    } catch {
      // Ignore silently
    }
    return null;
  }
}
