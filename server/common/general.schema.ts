import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class General extends Document {
  @Prop()
  innertubeApiKey: string;

  @Prop()
  version: number;
}

export const GeneralSchema = SchemaFactory.createForClass(General);
