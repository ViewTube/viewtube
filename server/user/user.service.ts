import { Injectable, HttpException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import { UserprofileDto } from 'server/user/dto/userprofile.dto';
import { User } from './schemas/user.schema';
import { UserDto } from './user.dto';
import { Settings } from './settings/schemas/settings.schema';
import { SettingsService } from './settings/settings.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly UserModel: Model<User>,
    private settingsService: SettingsService
  ) {}

  async getProfile(username: string): Promise<UserprofileDto> {
    if (username) {
      const userSettings = await this.settingsService.getSettings(username);
      return {
        username,
        settings: userSettings
      };
    }
  }

  async create(user: UserDto): Promise<UserprofileDto> {
    const existingUser: null | User = await this.findOne(user.username);
    if (existingUser !== null) {
      throw new HttpException(`User ${existingUser.username} already exists`, 400);
    } else {
      const saltRounds = 10;
      let hash: string;
      try {
        hash = await bcrypt.hash(user.password, saltRounds);
      } catch (err) {
        throw new HttpException('Error registering user', 403);
      }

      const createdUser = await new this.UserModel({
        username: user.username,
        password: hash
      }).save();
      return {
        username: createdUser.username
      };
    }
  }

  findOne(username: string): Promise<User> {
    return this.UserModel.findOne({ username }).exec();
  }

  findAll(): Promise<User[]> {
    return this.UserModel.find().exec();
  }
}
