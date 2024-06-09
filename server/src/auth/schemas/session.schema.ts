import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SESSION_EXPIRATION } from '../constants/session';

export type SessionDocument = Session & Document & { updatedAt: Date; createdAt: Date };

@Schema({ timestamps: true })
export class Session extends Document {
  @Prop({ index: { unique: true }, required: true })
  refreshToken: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, type: Date, expires: SESSION_EXPIRATION })
  expiresAt: Date;

  @Prop({ required: true })
  deviceName: string;

  @Prop({ required: true })
  deviceType: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
