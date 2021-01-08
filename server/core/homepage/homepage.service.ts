import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import fetch from 'node-fetch';
import { PopularDto } from './dto/popular.dto';
import { Popular } from './schemas/popular.schema';

@Injectable()
export class HomepageService {
  constructor(
    @InjectModel(Popular.name)
    private readonly PopularModel: Model<Popular>
  ) {}

  private popularPageUrl =
    'https://invidious.snopyta.org/api/v1/popular?fields=type,title,videoId,videoThumbnails,lengthSeconds,viewCount,author,authorId,publishedText';

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async refreshPopular(): Promise<void> {
    console.log('Refreshing popular page');
    try {
      const popularPage = await fetch(this.popularPageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:84.0) Gecko/20100101 Firefox/84.0'
        }
      }).then(val => val.json());
      const updatedPopularPage = new this.PopularModel({
        videos: popularPage,
        createdDate: Date.now().valueOf()
      });
      updatedPopularPage.save();
    } catch (err) {
      console.warn('Popular page refresh failed. URL: ' + this.popularPageUrl);
    }
  }

  async getPopular(): Promise<PopularDto> {
    if ((await this.PopularModel.estimatedDocumentCount()) === 0) {
      // Refreshes if the application has been started for the first time,
      // or the cronjob didn't run for some reason.
      await this.refreshPopular();
    }
    try {
      const popularVideos = await this.PopularModel.find()
        .sort({ createdDate: -1 })
        .limit(1)
        .exec();
      return {
        videos: popularVideos[0].videos,
        updatedAt: popularVideos[0].createdDate
      };
    } catch (error) {
      throw new InternalServerErrorException('Error loading the homepage.');
    }
  }
}
