import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// eslint-disable-next-line no-undef
@Schema({ timestamps: true })
export class Captcha extends Document {
  @Prop({
    type: Date,
    required: true,
    default: new Date(),
    expires: 300
  })
  createdAt: Date;

  @Prop({ required: true })
  clientToken: string;

  @Prop({ required: true })
  solution: string;
}

export const CaptchaSchema = SchemaFactory.createForClass(Captcha);
