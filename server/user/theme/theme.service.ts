import { Injectable, NotFoundException, Req, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ThemeDto } from '../../../shared/dto/theme/theme.dto';
import { Theme } from './schemas/theme.schema';

@Injectable()
export class ThemeService {
  constructor(
    @InjectModel(Theme.name)
    private readonly ThemeModel: Model<Theme>
  ) {}

  async getThemes(@Req() req: any): Promise<ThemeDto[]> {
    if (req.user && req.user.username) {
      const themes = await this.ThemeModel.find({ username: req.user.username });
      if (themes.length != 0) {
        return themes.map(value => {
          return {
            value: value.value,
            name: value.name,
            themeVariables: value.any.themeVariables
          };
        });
      }
      throw new NotFoundException();
    } else {
      throw new UnauthorizedException();
    }
  }

  async addTheme(@Req() req: any, theme: ThemeDto): Promise<boolean> {
    if (req.user && req.user.username) {
      return this.ThemeModel.create({
        username: req.user.username,
        name: theme.name,
        value: theme.value,
        any: { themeVariables: theme.themeVariables }
      }).then(
        () => {
          return true;
        },
        () => {
          return false;
        }
      );
    } else {
      throw new UnauthorizedException();
    }
  }

  async updateTheme(@Req() req: any, theme: ThemeDto): Promise<boolean> {
    if (req.user && req.user.username) {
      return this.ThemeModel.update(
        {
          username: req.user.username,
          value: theme.value
        },
        {
          username: req.user.username,
          name: theme.name,
          value: theme.value,
          any: { themeVariables: theme.themeVariables }
        }
      ).then(
        () => {
          return true;
        },
        () => {
          return false;
        }
      );
    } else {
      throw new UnauthorizedException();
    }
  }

  async deleteTheme(@Req() req: any, theme: ThemeDto): Promise<boolean> {
    if (req.user && req.user.username) {
      return this.ThemeModel.deleteOne({
        username: req.user.username,
        value: theme.value
      }).then(
        () => {
          return true;
        },
        () => {
          return false;
        }
      );
    } else {
      throw new UnauthorizedException();
    }
  }
}
