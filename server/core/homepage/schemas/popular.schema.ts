import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';

@Schema()
export class Popular extends Document {
  @Prop()
  videos: Array<VideoBasicInfoDto>;

  @Prop()
  createdDate: Date;
}

export const PopularSchema = SchemaFactory.createForClass(Popular);
