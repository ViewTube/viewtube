import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { HistoryDto } from '../dto/history.dto';
import { VideoVisitDto } from '../dto/video-visit.dto';

@Schema({ timestamps: true })
export class History extends Document implements HistoryDto {
  @Prop()
  username: string;

  @Prop()
  videoHistory: Array<VideoVisitDto>;
}

export const HistorySchema = SchemaFactory.createForClass(History);
