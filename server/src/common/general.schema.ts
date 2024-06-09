import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class General extends Document {
  @Prop()
  version: number;

  @Prop()
  lastSubscriptionsRefresh: number;
}

export const GeneralSchema = SchemaFactory.createForClass(General);
