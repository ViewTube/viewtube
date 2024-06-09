import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Subscription extends Document {
  @Prop({ index: { unique: true } })
  username: string;

  @Prop({ type: Array, required: true })
  subscriptions: Array<{
    channelId: string;
    createdAt?: Date;
  }>;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
