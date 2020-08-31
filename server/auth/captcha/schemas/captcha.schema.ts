import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Captcha extends Document {
  @Prop({ type: Date, required: true, default: new Date, index: { expires: '5m' } })
  createdAt: Date;

  @Prop({ required: true })
  clientToken: string;

  @Prop({ required: true })
  solution: string;
}

export const CaptchaSchema = SchemaFactory.createForClass(Captcha);