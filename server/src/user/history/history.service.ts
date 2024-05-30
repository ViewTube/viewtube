import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VideoBasicInfo } from 'server/core/videos/schemas/video-basic-info.schema';
import { SettingsService } from '../settings/settings.service';
import { VideoVisitDetailsDto } from './dto/video-visit-details.dto';
import { VideoVisitDto } from './dto/video-visit.dto';
import { History } from './schemas/history.schema';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name)
    private readonly HistoryModel: Model<History>,
    @InjectModel(VideoBasicInfo.name)
    private readonly VideoBasicInfoModel: Model<VideoBasicInfo>,
    private settingsService: SettingsService
  ) {}

  async setVideoVisit(
    username: string,
    videoId: string,
    progressSeconds: number,
    lengthSeconds: number,
    lastVisit: Date
  ) {
    if (username) {
      const userSettings = await this.settingsService.getSettings(username);
      if (!userSettings.saveVideoHistory) {
        throw new BadRequestException('User has disabled video history.');
      } else {
        try {
          const userHistory = await this.HistoryModel.findOne({ username }).exec();

          const userHistoryArray = userHistory ? userHistory.videoHistory : [];

          const currentVideoVisit = userHistoryArray.find(value => value.videoId === videoId);

          if (currentVideoVisit) {
            currentVideoVisit.lastVisit = lastVisit;
            if (progressSeconds) {
              currentVideoVisit.progressSeconds = progressSeconds;
            }

            if (lengthSeconds && currentVideoVisit.lengthSeconds !== lengthSeconds) {
              currentVideoVisit.lengthSeconds = lengthSeconds;
            }
          } else {
            userHistoryArray.push({
              videoId,
              progressSeconds,
              lengthSeconds,
              lastVisit
            });
          }

          await this.HistoryModel.findOneAndUpdate(
            { username },
            { username, videoHistory: userHistoryArray },
            { upsert: true }
          ).exec();
        } catch {
          throw new InternalServerErrorException('Error saving video visit');
        }
      }
    }
  }

  async getVideoVisit(username: string, videoId: string): Promise<VideoVisitDto> {
    const videoHistory = await this.HistoryModel.findOne({ username }).exec();

    const videoVisit = videoHistory?.videoHistory?.find(e => e.videoId === videoId);

    if (videoVisit) {
      return {
        progressSeconds: videoVisit.progressSeconds,
        lengthSeconds: videoVisit.lengthSeconds,
        lastVisit: videoVisit.lastVisit,
        videoId
      };
    } else {
      return {
        progressSeconds: 0,
        lengthSeconds: null,
        lastVisit: null,
        videoId
      };
    }
  }

  async getHistoryStats(username: string) {
    const history = await this.HistoryModel.findOne({ username })
      .exec()
      .catch(_ => {
        throw new NotFoundException('No history found for user');
      });
    if (history) {
      let totalSeconds = 0;
      history.videoHistory.forEach(el => {
        totalSeconds += el.progressSeconds;
      });
      const totalVideoCount = history.videoHistory.length;
      return {
        totalSeconds,
        totalVideoCount
      };
    }
    return {
      totalSeconds: 0,
      totalVideoCount: 0
    };
  }

  async getHistory(
    username: string,
    limit: number | null,
    start: number | null = 0,
    sort: 'ASC' | 'DESC' = 'ASC',
    filter: string = null
  ): Promise<{ videos: Array<VideoVisitDetailsDto>; videoCount: number }> {
    if (username) {
      const userHistory = await this.HistoryModel.findOne({ username })
        .exec()
        .catch(_ => {
          // Ignore silently
        });
      if (userHistory) {
        const videoHistoryItems = userHistory.videoHistory;
        const videoHistoryIds = videoHistoryItems.map(e => e.videoId);

        const historyVideos = await this.VideoBasicInfoModel.find({
          videoId: { $in: videoHistoryIds }
        }).exec();

        let videoVisitDetailsArray: Array<VideoVisitDetailsDto> = historyVideos.map(video => {
          const videoVisit = videoHistoryItems.find(e => e.videoId === video.videoId);
          return {
            lastVisit: videoVisit.lastVisit,
            lengthSeconds: videoVisit.lengthSeconds,
            progressSeconds: videoVisit.progressSeconds,
            videoDetails: video,
            videoId: video.videoId
          };
        });

        if (sort === 'ASC') {
          videoVisitDetailsArray = videoVisitDetailsArray.sort((a, b) => {
            return new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime();
          });
        } else if (sort === 'DESC') {
          videoVisitDetailsArray = videoVisitDetailsArray.sort((a, b) => {
            return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
          });
        }

        if (filter) {
          videoVisitDetailsArray = videoVisitDetailsArray.filter(e => {
            return (
              e.videoDetails.title.match(new RegExp(`.*${filter}.*`, 'i')) ||
              e.videoDetails.author.match(new RegExp(`.*${filter}.*`, 'i'))
            );
          });
        }

        const videoCount = videoVisitDetailsArray.length;

        let startNr = 0;
        let limitNr = videoVisitDetailsArray.length;
        if ((start as any) !== null) {
          startNr = parseInt(start as unknown as string);
        }
        if ((limit as any) !== null) {
          limitNr = parseInt(limit as unknown as string);
        }

        videoVisitDetailsArray = videoVisitDetailsArray.slice(startNr, startNr + limitNr);

        return {
          videoCount,
          videos: videoVisitDetailsArray
        };
      } else {
        return { videos: [], videoCount: 0 };
      }
    }
  }

  async deleteHistoryRange(username: string, startDate: string, endDate: string): Promise<void> {
    const userHistory = await this.HistoryModel.findOne({ username })
      .exec()
      .catch(_ => {
        throw new NotFoundException('No history found for user');
      });

    if (userHistory) {
      const firstDate = new Date(parseInt(startDate));
      const secondDate = new Date(parseInt(endDate));

      if (firstDate <= secondDate) {
        const newHistory = userHistory.videoHistory.filter(el => {
          const isInRange = el.lastVisit >= firstDate && el.lastVisit <= secondDate;
          return !isInRange;
        });
        await this.HistoryModel.findOneAndUpdate(
          { username },
          { username, videoHistory: newHistory }
        ).exec();
      }
    } else {
      throw new InternalServerErrorException('Error deleting history range');
    }
  }

  async deleteHistoryEntry(username: string, videoId: string): Promise<void> {
    await this.HistoryModel.updateOne({ username }, { $pull: { videoHistory: { videoId } } })
      .exec()
      .catch(_ => {
        throw new InternalServerErrorException('Error deleting history entry');
      });
  }

  async deleteCompleteHistory(username: string) {
    let success = true;
    await this.HistoryModel.deleteOne({ username })
      .exec()
      .catch(_ => {
        success = false;
      });
    return { success };
  }
}
