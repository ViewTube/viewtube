import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class BlockedVideo extends Document {
  @Prop()
  videoId: string;
}

export const BlockedVideoSchema = SchemaFactory.createForClass(BlockedVideo);
