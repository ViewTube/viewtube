import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ChannelBasicInfoDto } from 'server/core/channels/dto/channel-basic-info.dto';
import { VTThumbnailDto } from 'server/mapper/dto/vt-thumbnail.dto';

@Schema({ timestamps: true })
export class ChannelBasicInfo extends Document implements ChannelBasicInfoDto {
  @Prop({ index: { unique: true } })
  authorId: string;

  @Prop()
  author: string;

  @Prop()
  authorUrl?: string;

  @Prop()
  authorThumbnails?: Array<VTThumbnailDto>;

  @Prop()
  authorThumbnailUrl?: string;

  @Prop()
  authorVerified?: boolean;
}

export const ChannelBasicInfoSchema = SchemaFactory.createForClass(ChannelBasicInfo);
