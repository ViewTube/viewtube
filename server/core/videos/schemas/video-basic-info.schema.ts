import { Document } from 'mongoose';
import {
  Prop,
  Schema,
  SchemaFactory
} from '@nestjs/mongoose';
import { VideoThumbnailDto } from 'server/core/videos/dto/video-thumbnail.dto';
import { VideoBasicInfoDto } from '../dto/video-basic-info.dto';

@Schema({ timestamps: true })
export class VideoBasicInfo
  extends Document
  implements VideoBasicInfoDto {
  @Prop({ index: { unique: true } })
  videoId: string;

  @Prop()
  title: string;

  @Prop()
  published: number;

  @Prop()
  publishedText: string;

  @Prop()
  author: string;

  @Prop()
  authorId: string;

  @Prop()
  videoThumbnails: Array<VideoThumbnailDto>;

  @Prop()
  description: string;

  @Prop()
  viewCount: number;

  @Prop()
  likeCount: number;

  @Prop()
  dislikeCount: number;

  @Prop()
  lengthSeconds?: number;
}

export const VideoBasicInfoSchema = SchemaFactory.createForClass(
  VideoBasicInfo
);
