import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class BlockedVideo extends Document {
  @Prop()
  videoId: string;
}

export const BlockedVideoSchema = SchemaFactory.createForClass(BlockedVideo);
