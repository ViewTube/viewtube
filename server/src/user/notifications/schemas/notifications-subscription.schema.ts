import { Document } from 'mongoose';
import { PushSubscription } from 'web-push';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { NotificationsSubscriptionKeys } from '../dto/notifications-subscription-keys.dto';

// eslint-disable-next-line no-undef
@Schema({ timestamps: true })
export class NotificationsSubscription extends Document implements PushSubscription {
  @Prop()
  endpoint: string;

  @Prop()
  username: string;

  @Prop()
  keys: NotificationsSubscriptionKeys;
}

export const NotificationsSubscriptionSchema =
  SchemaFactory.createForClass(NotificationsSubscription);
