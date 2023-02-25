import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { VideoDto } from '../dto/video.dto';
import { RecommendedVideoDto } from '../dto/recommended-video.dto';
import { AuthorThumbnailDto } from '../dto/author-thumbnail.dto';
import { VTThumbnailDto } from 'server/mapper/dto/vt-thumbnail.dto';

// eslint-disable-next-line no-undef
@Schema({ timestamps: true })
export class Video extends Document implements VideoDto {
  @Prop({ index: { unique: true } })
  videoId: string;

  type: string;
  title: string;
  videoThumbnails: VTThumbnailDto[];
  storyboards: object;
  description: string;
  descriptionHtml: string;
  published: number;
  publishedText: string;
  keywords: string[];
  viewCount: number;
  likeCount: number;
  dislikeCount?: number;
  paid: boolean;
  premium: boolean;
  isFamilyFriendly: boolean;
  allowedRegions: string[];
  genre: string;
  genreUrl: string;
  author: string;
  authorId: string;
  authorUrl: string;
  authorThumbnails: AuthorThumbnailDto[];
  authorVerified: boolean;
  subCount: number;
  lengthSeconds: number;
  allowRatings: boolean;
  rating: number;
  isListed: boolean;
  liveNow: boolean;
  isUpcoming: boolean;
  adaptiveFormats: object[];
  legacyFormats: object[];
  captions: object;
  recommendedVideos: RecommendedVideoDto[];
}

export const VideoSchema = SchemaFactory.createForClass(Video);
