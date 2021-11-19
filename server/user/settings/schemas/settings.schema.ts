import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SettingsDto, segmentOption } from '../dto/settings.dto';

// eslint-disable-next-line no-undef
@Schema({ timestamps: true })
export class Settings extends Document implements SettingsDto {
  @Prop()
  username: string;

  @Prop()
  miniplayer: boolean;

  @Prop()
  chapters: boolean;

  @Prop()
  theme: string;

  @Prop()
  sponsorblockEnabled: boolean;

  @Prop()
  sponsorblockSegmentSponsor: segmentOption;

  @Prop()
  sponsorblockSegmentIntro: segmentOption;

  @Prop()
  sponsorblockSegmentOutro: segmentOption;

  @Prop()
  sponsorblockSegmentInteraction: segmentOption;

  @Prop()
  sponsorblockSegmentSelfpromo: segmentOption;

  @Prop()
  sponsorblockSegmentMusicOfftopic: segmentOption;

  @Prop()
  sponsorblockSegmentPreview: segmentOption;

  @Prop()
  autoplay: boolean;

  @Prop()
  saveVideoHistory: boolean;

  @Prop()
  showHomeSubscriptions: boolean;

  @Prop()
  alwaysLoopVideo: boolean;

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
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
