import { Document } from 'mongoose';
import {
  Prop,
  Schema,
  SchemaFactory
} from '@nestjs/mongoose';

// eslint-disable-next-line no-undef
@Schema({ timestamps: true })
export class User extends Document {
  @Prop()
  username: string;

  @Prop()
  profileImage: string;

  @Prop()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(
  User
);
