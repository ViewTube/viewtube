import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// eslint-disable-next-line no-undef
@Schema({ timestamps: true })
export class Theme extends Document {
  @Prop({ index: { unique: false } })
  username: string;

  @Prop({ index: { unique: false } })
  value: string;

  @Prop()
  name: string;

  @Prop({ type: {} })
  themeVariables: any;
}

export const ThemeSchema = SchemaFactory.createForClass(Theme).index(
  { username: 1, value: 1 },
  { unique: true }
);
