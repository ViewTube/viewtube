import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SponsorblockSettingsDto } from '../dto/sponsorblock-settings.dto';

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
  sponsorblock: SponsorblockSettingsDto;

  @Prop()
  autoplay: boolean;

  @Prop()
  saveVideoHistory: boolean;

  @Prop()
  showHomeSubscriptions: boolean;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
