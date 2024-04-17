import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ index: { unique: true } })
  username: string;

  @Prop()
  profileImage: string;

  @Prop()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
