import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SettingsDto } from './dto/settings.dto';
import { Settings } from './schemas/settings.schema';

/**
 * Settings keys that were renamed, mapped to the key they were stored under before.
 */
const legacySettingsKeys: Partial<Record<keyof SettingsDto, string>> = {
  showHomePopularVideos: 'showHomeTrendingVideos'
};

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectModel(Settings.name)
    private readonly SettingsModel: Model<Settings>
  ) {}

  private defaultOptions: SettingsDto = {
    alwaysLoopVideo: false,
    hideComments: false,
    videoSpeedAsList: false,
    audioModeDefault: false,
    autoAdjustAudioQuality: true,
    autoAdjustVideoQuality: true,
    autoplay: false,
    autoplayNextVideo: false,
    chapters: true,
    defaultAudioQuality: '192kb',
    maxVideoQuality: '1080p',
    defaultVideoSpeed: 1,
    saveVideoHistory: true,
    showHomeSubscriptions: true,
    showHomePopularVideos: true,
    showRecommendedVideos: true,
    sponsorblockUrl: 'https://sponsor.ajay.app/',
    sponsorblockEnabled: true,
    sponsorblockSegmentInteraction: 'ask',
    sponsorblockSegmentIntro: 'ask',
    sponsorblockSegmentMusicOfftopic: 'ask',
    sponsorblockSegmentOutro: 'ask',
    sponsorblockSegmentPreview: 'ask',
    sponsorblockSegmentSelfpromo: 'ask',
    sponsorblockSegmentSponsor: 'ask',
    sponsorblockSegmentFiller: 'none',
    theme: 'default',
    rewriteYouTubeURLs: false,
    hideShortsFromSearch: false
  };

  async onModuleInit(): Promise<void> {
    await this.migrateLegacySettingsKeys();
  }

  /**
   * Moves renamed settings to their current key, so a rename doesn't reset user preferences.
   * Idempotent, and never throws: failing to migrate must not stop the server from starting.
   */
  private async migrateLegacySettingsKeys(): Promise<void> {
    for (const [currentKey, legacyKey] of Object.entries(legacySettingsKeys)) {
      try {
        const result = await this.SettingsModel.updateMany(
          { [legacyKey]: { $exists: true } },
          [
            { $set: { [currentKey]: { $ifNull: [`$${currentKey}`, `$${legacyKey}`] } } },
            { $unset: legacyKey }
          ],
          { updatePipeline: true }
        ).exec();

        if (result.modifiedCount) {
          this.logger.log(
            `Migrated ${result.modifiedCount} settings documents from ${legacyKey} to ${currentKey}`
          );
        }
      } catch (error) {
        this.logger.warn(`Failed to migrate ${legacyKey} to ${currentKey}: ${error?.message}`);
      }
    }
  }

  async setSettings(settings: Partial<SettingsDto>, username: string): Promise<void> {
    if (!username) {
      throw new InternalServerErrorException('Error finding user');
    }

    try {
      await this.SettingsModel.findOneAndUpdate(
        { username },
        { $set: settings, $unset: { showHomeTrendingVideos: 1 } },
        { upsert: true }
      ).exec();
    } catch {
      throw new InternalServerErrorException('Error updating settings');
    }
  }

  async getSettings(username: string): Promise<SettingsDto> {
    if (!username) return;

    try {
      // lean, because mongoose strips keys that are no longer part of the schema
      const settings = (await this.SettingsModel.findOne({ username }).lean().exec()) || {};
      return this.getCompleteSettingsObject(settings);
    } catch {
      throw new InternalServerErrorException('Error retrieving settings');
    }
  }

  async deleteSettings(username: string): Promise<{ success: boolean }> {
    let success = true;
    await this.SettingsModel.deleteOne({ username })
      .exec()
      .catch(_ => {
        success = false;
      });
    return { success };
  }

  private getCompleteSettingsObject(
    settings: Partial<SettingsDto> & Record<string, unknown>
  ): SettingsDto {
    const completeSettings: SettingsDto = {} as SettingsDto;
    Object.keys(this.defaultOptions).forEach(settingsKey => {
      const legacyKey = legacySettingsKeys[settingsKey];

      if (settings[settingsKey] !== undefined) {
        completeSettings[settingsKey] = settings[settingsKey];
      } else if (legacyKey && settings[legacyKey] !== undefined) {
        completeSettings[settingsKey] = settings[legacyKey];
      } else {
        completeSettings[settingsKey] = this.defaultOptions[settingsKey];
      }
    });
    return completeSettings;
  }
}
