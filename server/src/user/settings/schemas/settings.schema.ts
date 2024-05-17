import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SettingsDto, segmentOption } from '../dto/settings.dto';

// eslint-disable-next-line no-undef
@Schema({ timestamps: true })
export class Settings extends Document implements SettingsDto {
  @Prop()
  username: string;

  @Prop()
  chapters: boolean;

  @Prop()
  theme: string;

  @Prop()
  sponsorblockEnabled: boolean;

  @Prop({ type: String })
  sponsorblockSegmentSponsor: segmentOption;

  @Prop({ type: String })
  sponsorblockSegmentIntro: segmentOption;

  @Prop({ type: String })
  sponsorblockSegmentOutro: segmentOption;

  @Prop({ type: String })
  sponsorblockSegmentInteraction: segmentOption;

  @Prop({ type: String })
  sponsorblockSegmentSelfpromo: segmentOption;

  @Prop({ type: String })
  sponsorblockSegmentMusicOfftopic: segmentOption;

  @Prop({ type: String })
  sponsorblockSegmentPreview: segmentOption;

  @Prop()
  autoplay: boolean;

  @Prop()
  saveVideoHistory: boolean;

  @Prop()
  showHomeSubscriptions: boolean;

  @Prop()
  showHomeTrendingVideos: boolean;

  @Prop()
  showRecommendedVideos: boolean;

  @Prop()
  alwaysLoopVideo: boolean;

  @Prop()
  hideComments: boolean;

  @Prop()
  videoSpeedAsList: boolean;

  @Prop()
  autoplayNextVideo: boolean;

  @Prop()
  audioModeDefault: boolean;

  @Prop()
  defaultVideoSpeed: number;

  @Prop()
  defaultVideoQuality: string;

  @Prop()
  defaultAudioQuality: string;

  @Prop()
  autoAdjustAudioQuality: boolean;

  @Prop()
  autoAdjustVideoQuality: boolean;

  @Prop()
  dashPlaybackEnabled: boolean;

  @Prop()
  rewriteYouTubeURLs: boolean;

  @Prop()
  hideShortsFromSearch: boolean;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
