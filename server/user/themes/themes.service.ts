import { Injectable } from '@nestjs/common';
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
    return await this.themeModel.find({ username }).select('-username').exec().catch(console.log);
  }

  async insertTheme(theme: ThemesDto) {
    await this.themeModel.create(theme).catch(console.log);
  }

  async updateTheme(theme: ThemesDto): Promise<ThemesDto | void> {
    return await this.themeModel
      .findOneAndUpdate({ username: theme.username, key: theme.key }, theme)
      .select('-username')
      .catch(console.log);
  }

  async deleteTheme(key: string, username: string): Promise<ThemesDto | void> {
    return await this.themeModel
      .findOneAndDelete({ username, key })
      .select('-username')
      .catch(console.log);
  }
}
