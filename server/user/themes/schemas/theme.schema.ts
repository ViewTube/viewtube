import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ThemesDto } from '../dto/themes.dto';

@Schema({ timestamps: true })
export class Theme extends Document implements ThemesDto {
  @Prop({ unique: false, required: true })
  username: string;
  @Prop({ unique: false, required: true })
  key: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  variables: [string, string][];
}

export const ThemeSchema = SchemaFactory.createForClass(Theme);
ThemeSchema.index({ username: 1, key: 1 }, { unique: true });
