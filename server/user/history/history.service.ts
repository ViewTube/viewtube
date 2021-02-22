import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { History } from './schemas/history.schema';
import { HistoryDto } from './dto/history.dto';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name)
    private readonly HistoryModel: Model<History>
  ) {}

  async setHistory(history: Partial<HistoryDto>, username: string): Promise<void> {
    if (username) {
      try {
        await this.HistoryModel.findOneAndUpdate({ username }, history, { upsert: true }).exec();
      } catch (err) {
        throw new InternalServerErrorException('Error updating history');
      }
    } else {
      throw new InternalServerErrorException('Error finding user');
    }
  }

  async getHistory(username: string): Promise<HistoryDto> {
    if (username) {
      try {
        const history = (await this.HistoryModel.findOne({ username }).exec()) || {};
        return this.getCompleteHistoryObject(history);
      } catch (err) {
        throw new InternalServerErrorException('Error retrieving history');
      }
    }
  }

  private getCompleteHistoryObject(history: Partial<HistoryDto>): HistoryDto {
    const completeHistory: HistoryDto = {
      autoplay: this.getValid(history.autoplay, true),
      chapters: this.getValid(history.chapters, true),
      miniplayer: this.getValid(history.miniplayer, true),
      saveVideoHistory: this.getValid(history.saveVideoHistory, true),
      sponsorblock: this.getValid(history.sponsorblock, {
        enabled: true,
        interaction: 'skip',
        intro: 'ask',
        music_offtopic: 'skip',
        outro: 'ask',
        selfpromo: 'skip',
        sponsor: 'skip'
      }),
      theme: this.getValid(history.theme, 'dark'),
      username: history.username
    };
    return completeHistory;
  }

  private getValid(value: any, defaultValue: any) {
    if (value !== undefined && defaultValue !== null) {
      return value;
    }
    return defaultValue;
  }
}
