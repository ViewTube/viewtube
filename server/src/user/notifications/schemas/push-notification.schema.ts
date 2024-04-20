import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PushNotificationDto } from 'server/user/dto/push-notification.dto';

@Schema({ timestamps: true, id: false })
export class PushNotification extends Document implements PushNotificationDto {
  @Prop({ required: true })
  declare id: string;

  @Prop({ required: true })
  username: string;

  content: any;

  @Prop()
  sentAt: Date;
}

export const PushNotificationSchema = SchemaFactory.createForClass(PushNotification);
