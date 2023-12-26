import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ServerSettingsDto } from '../dto/server-settings.dto';

@Schema()
export class ServerSettings extends Document implements ServerSettingsDto {
  @Prop()
  version: number;

  @Prop()
  registrationEnabled: boolean;
}

export const ServerSettingsSchema = SchemaFactory.createForClass(ServerSettings);
