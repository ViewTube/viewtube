import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AuthorThumbnailDto } from 'viewtube/shared/dto/video/author-thumbnail.dto';
import { ChannelBasicInfoDto } from '../dto/channel-basic-info.dto';

// eslint-disable-next-line no-undef
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
