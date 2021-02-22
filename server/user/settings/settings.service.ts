import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Settings } from './schemas/settings.schema';
import { SettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name)
    private readonly SettingsModel: Model<Settings>
  ) {}

  async setSettings(settings: Partial<SettingsDto>, username: string): Promise<void> {
    if (username) {
      try {
        await this.SettingsModel.findOneAndUpdate({ username }, settings, { upsert: true }).exec();
      } catch (err) {
        throw new InternalServerErrorException('Error updating settings');
      }
    } else {
      throw new InternalServerErrorException('Error finding user');
    }
  }

  async getSettings(username: string): Promise<SettingsDto> {
    if (username) {
      try {
        const settings = (await this.SettingsModel.findOne({ username }).exec()) || {};
        return this.getCompleteSettingsObject(settings);
      } catch (err) {
        throw new InternalServerErrorException('Error retrieving settings');
      }
    }
  }

  private getCompleteSettingsObject(settings: Partial<SettingsDto>): SettingsDto {
    const completeSettings: SettingsDto = {
      autoplay: this.getValid(settings.autoplay, true),
      chapters: this.getValid(settings.chapters, true),
      miniplayer: this.getValid(settings.miniplayer, true),
      saveVideoHistory: this.getValid(settings.saveVideoHistory, true),
      sponsorblock: this.getValid(settings.sponsorblock, {
        enabled: true,
        interaction: 'skip',
        intro: 'ask',
        music_offtopic: 'skip',
        outro: 'ask',
        selfpromo: 'skip',
        sponsor: 'skip'
      }),
      theme: this.getValid(settings.theme, 'default')
    };
    return completeSettings;
  }

  private getValid(value: any, defaultValue: any) {
    if (value !== undefined && defaultValue !== null) {
      return value;
    }
    return defaultValue;
  }
}
