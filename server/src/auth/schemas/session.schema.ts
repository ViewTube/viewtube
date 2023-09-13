import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Session extends Document {
  @Prop({ index: { unique: true }, required: true })
  refreshToken: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, type: Date, expires: 604800, default: Date.now() })
  expiresAt: Date;

  @Prop({ required: true })
  deviceName: string;

  @Prop({ required: true })
  deviceType: string;

  @Prop({ required: true, type: Date, default: Date.now() })
  lastUsed: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
