import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Consola from 'consola';
import { Model } from 'mongoose';
import { ThemeDto } from '../../../shared/dto/theme/theme.dto';
import { Theme } from './schemas/theme.schema';
@Injectable()
export class ThemeService {
  constructor(
    @InjectModel(Theme.name)
    private readonly ThemeModel: Model<Theme>
  ) {}

  async getThemes(req: any): Promise<ThemeDto[]> {
    if (req.user && req.user.username) {
      const themes = await this.ThemeModel.find({ username: req.user.username })
        .sort('name')
        .catch(error => {
          Consola.error(error);
          throw new InternalServerErrorException();
        });
      if (themes.length !== 0) {
        return themes.map(value => {
          return {
            value: value.value,
            name: value.name,
            themeVariables: value.themeVariables
          } as ThemeDto;
        });
      }
      return [];
    } else {
      throw new UnauthorizedException();
    }
  }

  addTheme(req: any, theme: ThemeDto): Promise<boolean> {
    if (req.user && req.user.username) {
      return this.ThemeModel.create({
        username: req.user.username,
        name: theme.name,
        value: theme.value,
        themeVariables: theme.themeVariables
      })
        .catch(error => {
          Consola.error(error);
          throw new InternalServerErrorException();
        })
        .then(
          () => {
            return true;
          },
          () => {
            throw new BadRequestException('Theme creation failed. May already exist.');
          }
        );
    } else {
      throw new UnauthorizedException();
    }
  }

  updateTheme(req: any, theme: ThemeDto): Promise<boolean> {
    if (req.user && req.user.username) {
      return this.ThemeModel.updateOne(
        {
          username: req.user.username,
          value: theme.value
        },
        {
          username: req.user.username,
          name: theme.name,
          value: theme.value,
          themeVariables: theme.themeVariables
        }
      )
        .catch(error => {
          Consola.error(error);
          throw new InternalServerErrorException();
        })
        .then(
          () => {
            return true;
          },
          () => {
            throw new BadRequestException('Theme update failed');
          }
        );
    } else {
      throw new UnauthorizedException();
    }
  }

  deleteTheme(req: any, theme: ThemeDto): Promise<boolean> {
    if (req.user && req.user.username) {
      return this.ThemeModel.deleteOne({
        username: req.user.username,
        value: theme.value
      })
        .catch(error => {
          Consola.error(error);
          throw new InternalServerErrorException();
        })
        .then(
          () => {
            return true;
          },
          () => {
            throw new NotFoundException();
          }
        );
    } else {
      throw new UnauthorizedException();
    }
  }
}
