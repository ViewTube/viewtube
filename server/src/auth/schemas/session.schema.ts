import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Session extends Document {
  @Prop({ index: { unique: true } })
  refreshToken: string;

  @Prop()
  username: string;

  @Prop()
  expiresAt: Date;

  @Prop()
  deviceName: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
