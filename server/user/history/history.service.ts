import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { VideoBasicInfo } from 'server/core/videos/schemas/video-basic-info.schema';
import { History } from './schemas/history.schema';
import { VideoVisitDetailsDto } from './dto/video-visit-details.dto';
import { VideoVisitDto } from './dto/video-visit.dto';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name)
    private readonly HistoryModel: Model<History>,
    @InjectModel(VideoBasicInfo.name)
    private readonly VideoBasicInfoModel: Model<VideoBasicInfo>
  ) {}

  async setVideoVisit(
    username: string,
    videoId: string,
    progressSeconds: number,
    lengthSeconds: number,
    lastVisit: Date
  ) {
    if (username) {
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
      } catch (error) {
        throw new InternalServerErrorException('Error saving video visit');
      }
    }
  }

  async getVideoVisit(username: string, videoId: string): Promise<VideoVisitDto> {
    const videoHistory = await this.HistoryModel.findOne({ username }).exec();

    const videoVisit = videoHistory.videoHistory.find(e => e.videoId === videoId);

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
      .catch(_ => {});
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
    limit: number = 30,
    start: number = 0,
    sort: 'ASC' | 'DESC' = 'ASC',
    filter: string = null
  ): Promise<{ videos: Array<VideoVisitDetailsDto>; videoCount: number }> {
    if (username) {
      const history = await this.HistoryModel.findOne({ username })
        .exec()
        .catch(_ => {});
      if (history) {
        const videoCount = history.videoHistory.length;

        const userHistory = await this.HistoryModel.findOne({ username })
          .exec()
          .catch(_ => {});

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
          if (start < limit) {
            if (start) {
              videoVisitDetailsArray = videoVisitDetailsArray.splice(0, start);
            }

            if (limit) {
              videoVisitDetailsArray = videoVisitDetailsArray.splice(0, limit);
            }
          }

          return {
            videoCount,
            videos: videoVisitDetailsArray
          };
        }
      } else {
        return { videos: [], videoCount: 0 };
      }
    }
  }
}
