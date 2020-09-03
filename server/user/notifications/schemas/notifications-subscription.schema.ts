import { Document } from "mongoose";
import { PushSubscription } from "web-push";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";


@Schema({ timestamps: true })
export class NotificationsSubscription extends Document implements PushSubscription {
  @Prop()
  endpoint: string;

  @Prop()
  username: string;

  @Prop()
  keys: {
    p256dh: string;
    auth: string;
  }
}

export const NotificationsSubscriptionSchema = SchemaFactory.createForClass(NotificationsSubscription);