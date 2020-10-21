import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AuthorThumbnailDto } from 'shared/dto/video/author-thumbnail.dto';
import { ChannelBasicInfoDto } from '../dto/channel-basic-info.dto';

@Schema({ timestamps: true })
export class ChannelBasicInfo extends Document implements ChannelBasicInfoDto {
  @Prop({ index: { unique: true } })
  authorId: string;

  @Prop()
  author: string;

  @Prop()
  authorUrl?: string;

  @Prop()
  authorThumbnails?: Array<AuthorThumbnailDto>;

  @Prop()
  authorThumbnailUrl?: string;

  @Prop()
  authorVerified?: boolean;
}

export const ChannelBasicInfoSchema = SchemaFactory.createForClass(ChannelBasicInfo);
