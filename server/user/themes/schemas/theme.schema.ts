import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ThemesDto, ThemeVariableType } from '../dto/themes.dto';

@Schema({ timestamps: true })
export class Theme extends Document implements ThemesDto {
  @Prop({ unique: false, required: true })
  username: string;

  @Prop({ unique: false, required: true })
  key: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  variables: ThemeVariableType[];
}

export const ThemeSchema = SchemaFactory.createForClass(Theme);
ThemeSchema.index({ username: 1, key: 1 }, { unique: true });
