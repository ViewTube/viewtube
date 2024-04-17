import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { VTThumbnailDto } from 'server/mapper/dto/vt-thumbnail.dto';
import type { VideoBasicInfoDto } from '../dto/video-basic-info.dto';
@Schema({ timestamps: true })
export class VideoBasicInfo extends Document implements VideoBasicInfoDto {
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

  @Prop({ index: true })
  authorId: string;

  @Prop()
  authorThumbnails?: Array<VTThumbnailDto>;

  @Prop()
  authorThumbnailUrl?: string;

  @Prop()
  authorVerified?: boolean;

  @Prop()
  videoThumbnails: Array<VTThumbnailDto>;

  @Prop()
  description: string;

  @Prop()
  viewCount: number;

  @Prop()
  likeCount: number;

  @Prop()
  dislikeCount?: number;

  @Prop()
  lengthSeconds?: number;
}

export const VideoBasicInfoSchema = SchemaFactory.createForClass(VideoBasicInfo);
