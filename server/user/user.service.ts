import { Injectable, HttpException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { UserDto } from './user.dto';
import bcrypt from 'bcryptjs';
import { UserprofileDto } from 'server/user/dto/userprofile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

  async create(user: UserDto): Promise<UserprofileDto> {
    const existingUser: null | User = await this.findOne(user.username);
    if (existingUser !== null) {
      throw new HttpException(
        `User ${existingUser.username} already exists`,
        400,
      );
    } else {
      const saltRounds = 10;
      let hash: string;
      try {
        hash = await bcrypt.hash(user.password, saltRounds);
      } catch (err) {
        console.error(err);
        throw new HttpException('Error registering user', 403);
      }

      const createdUser = await new this.userModel({
        username: user.username,
        password: hash
      }).save();
      return {
        username: createdUser.username
      };
    }
  }

  async findOne(username: string): Promise<User> {
    return this.userModel.findOne({ username }).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
