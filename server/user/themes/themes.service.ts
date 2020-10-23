import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ThemesDto } from './dto/themes.dto';
import { Theme } from './schemas/theme.schema';

@Injectable()
export class ThemesService {
  constructor(
    @InjectModel(Theme.name)
    private readonly themeModel: Model<Theme>
  ) {}

  async getAllThemes(username: string): Promise<Array<ThemesDto> | void> {
    return await this.themeModel
      .find({ username })
      .select('-username')
      .exec()
      .then(
        () => {
          console.info(`Fetched Themes for ${username}`);
        },
        err => {
          console.error(err);
          throw new InternalServerErrorException("Couldn't fetch themes");
        }
      );
  }

  async insertTheme(theme: ThemesDto) {
    await this.themeModel.create(theme).then(
      () => {
        console.info(`Added Theme for user ${theme.username}, key ${theme.key}`);
      },
      err => {
        console.error(err);
        throw new BadRequestException('Cannot create theme, duplicate key possibly');
      }
    );
  }

  async updateTheme(theme: ThemesDto): Promise<ThemesDto | void> {
    return await this.themeModel
      .findOneAndUpdate({ username: theme.username, key: theme.key }, theme)
      .select('-username')
      .then(
        () => {
          console.info(`Updated Theme for user ${theme.username}, key ${theme.key}`);
        },
        err => {
          console.error(err);
          throw new NotFoundException('No theme to be updated found');
        }
      );
  }

  async deleteTheme(key: string, username: string): Promise<ThemesDto | void> {
    return await this.themeModel
      .findOneAndDelete({ username, key })
      .select('-username')
      .then(
        () => {
          console.info(`Deleted Theme for user ${username}, key ${key}`);
        },
        err => {
          console.error(err);
          throw new NotFoundException('No theme to be deleted found');
        }
      );
  }
}
