import cluster from 'cluster';
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { AppClusterService } from 'server/app-cluster.service';
import { ChannelBasicInfo } from '../channels/schemas/channel-basic-info.schema';
import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';
import { PopularDto } from './dto/popular.dto';
import { Popular } from './schemas/popular.schema';
import { ConfigService } from '@nestjs/config';
import { innertubeClient } from 'server/common/innertube';
import { HomeFeed } from 'youtubei.js/dist/src/parser/youtube';
import { mapHomeFeed } from './mapper/homefeed.mapper';

@Injectable()
export class HomepageService {
  constructor(
    @InjectModel(Popular.name)
    private readonly PopularModel: Model<Popular>,
    @InjectModel(ChannelBasicInfo.name)
    private readonly ChannelBasicInfoModel: Model<ChannelBasicInfo>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
    private readonly logger: Logger
  ) {
    this.popularPageUrl = `${this.configService.get(
      'HOMEPAGE_INVIDIOUS_URL'
    )}/api/v1/popular?fields=type,title,videoId,videoThumbnails,lengthSeconds,viewCount,author,authorId,publishedText&hl=en-US`;
  }

  private popularPageUrl: string;

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async refreshPopular(): Promise<void> {
    let expired = false;
    const clusterWorker1 = cluster.worker && cluster.worker.id === 1;
    const notClustered = !AppClusterService.isClustered;

    const oldPopularPage = await this.PopularModel.find().sort({ createdDate: -1 }).limit(1).exec();
    if (oldPopularPage && oldPopularPage[0]) {
      const expireTime = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
      if (oldPopularPage[0].createdDate < expireTime) {
        expired = true;
      }
    }
    if (!oldPopularPage || oldPopularPage.length <= 0) {
      expired = true;
    }
    if (expired && (clusterWorker1 || notClustered)) {
      this.logger.log('Refreshing popular page');
      try {
        const popularPage = (await fetch(this.popularPageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:84.0) Gecko/20100101 Firefox/84.0'
          }
        }).then(val => val.json())) as Array<unknown>;
        const popularVideos = [];
        await Promise.allSettled(
          popularPage.map(async (video: VideoBasicInfoDto) => {
            const hasResult = await fetch(`https://i.ytimg.com/vi/${video.videoId}/default.jpg`)
              .then(response => response.ok)
              .catch(_ => {
                return false;
              });
            if (hasResult) {
              popularVideos.push(video);
            } else {
              // Ignores videos, where thumbnails return an error, as they are most likely unavailable
            }
          })
        );

        const channelIds = popularVideos.map((video: VideoBasicInfoDto) => video.authorId);

        const channelBasicInfoArray = await this.ChannelBasicInfoModel.find({
          authorId: { $in: channelIds }
        }).exec();

        popularVideos.forEach((video: VideoBasicInfoDto) => {
          const channelInfo = channelBasicInfoArray.find(
            channel => channel.authorId === video.authorId
          );
          if (channelInfo) {
            if (channelInfo.authorThumbnailUrl) {
              video.authorThumbnailUrl = channelInfo.authorThumbnailUrl;
            } else if (channelInfo.authorThumbnails) {
              video.authorThumbnails = channelInfo.authorThumbnails;
            }

            if (channelInfo.authorVerified) {
              video.authorVerified = channelInfo.authorVerified;
            }
          }
        });

        if (popularVideos.length > 0) {
          const updatedPopularPage = new this.PopularModel({
            videos: popularVideos,
            createdDate: Date.now().valueOf()
          });
          updatedPopularPage.save();
        }

        await this.cacheManager.del('popular');
        this.logger.log('Refreshed popular page');
      } catch (err) {
        this.logger.error('Popular page refresh failed. URL: ' + this.popularPageUrl);
        this.logger.error(err);
      }
    }
  }

  async getPopular(): Promise<PopularDto> {
    try {
      const popularVideos = await this.PopularModel.find()
        .sort({ createdDate: -1 })
        .limit(1)
        .exec();
      if (popularVideos && popularVideos[0]) {
        return {
          videos: popularVideos[0].videos,
          updatedAt: popularVideos[0].createdDate
        };
      }
      return {
        videos: [],
        updatedAt: null
      };
    } catch (error) {
      throw new InternalServerErrorException('Error loading the homepage.');
    }
  }

  async getHomeFeed() {
    const client = await innertubeClient;
    const homeFeed = await client.getHomeFeed();
    return {
      videos: mapHomeFeed(homeFeed)
    };
  }
}
