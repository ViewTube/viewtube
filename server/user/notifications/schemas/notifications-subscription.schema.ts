import { Document } from 'mongoose';
import { PushSubscription } from 'web-push';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { NotificationsSubscriptionKeys } from '../dto/notifications-subscription-keys.dto';

@Schema({ timestamps: true })
export class NotificationsSubscription extends Document implements PushSubscription {
  @Prop()
  endpoint: string;

  @Prop()
  username: string;

  @Prop()
  keys: NotificationsSubscriptionKeys;
}

export const NotificationsSubscriptionSchema = SchemaFactory.createForClass(
  NotificationsSubscription
);
