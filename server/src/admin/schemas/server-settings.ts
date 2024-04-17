import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { ServerSettingsDto } from '../dto/server-settings.dto';

@Schema()
export class ServerSettings extends Document implements ServerSettingsDto {
  @Prop()
  version: number;

  @Prop()
  registrationEnabled: boolean;

  @Prop()
  requireLoginEverywhere: boolean;
}

export const ServerSettingsSchema = SchemaFactory.createForClass(ServerSettings);
