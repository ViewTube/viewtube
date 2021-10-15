import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { VideoThumbnailDto } from 'viewtube/shared/dto/video/video-thumbnail.dto';
import { AuthorThumbnailDto } from 'viewtube/shared/dto/video/author-thumbnail.dto';
import { VideoBasicInfoDto } from '../dto/video-basic-info.dto';

// eslint-disable-next-line no-undef
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

  @Prop()
  authorId: string;

  @Prop()
  authorThumbnails?: Array<AuthorThumbnailDto>;

  @Prop()
  authorThumbnailUrl?: string;

  @Prop()
  authorVerified?: boolean;

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

export const VideoBasicInfoSchema = SchemaFactory.createForClass(VideoBasicInfo);
