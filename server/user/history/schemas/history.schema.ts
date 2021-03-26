import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { VideoVisitDto } from '../dto/video-visit.dto';
import { HistoryDto } from '../dto/history.dto';

// eslint-disable-next-line no-undef
@Schema({ timestamps: true })
export class History extends Document implements HistoryDto {
  @Prop()
  username: string;

  @Prop()
  videoHistory: Array<VideoVisitDto>;
}

export const HistorySchema = SchemaFactory.createForClass(History);
