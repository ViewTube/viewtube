import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ParamsDto } from '../dto/params.dto';

@Schema({ timestamps: true })
export class ApiRequest extends Document {
  @Prop()
  url: string;

  @Prop()
  params: ParamsDto;

  @Prop()
  requestDuration: number;

  @Prop()
  timestamp: number;
}

export const ApiRequestSchema = SchemaFactory.createForClass(ApiRequest);
