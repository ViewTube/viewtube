import {
  Controller,
  Get,
  UseGuards,
  Req,
  Put,
  Body,
  Post,
  UnauthorizedException,
  Param,
  Delete,
  ForbiddenException
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'server/auth/guards/jwt.guard';
import { ThemesDto } from './dto/themes.dto';
import { ThemesService } from './themes.service';

@ApiTags('User')
@Controller('user/themes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ThemesController {
  constructor(private themesService: ThemesService) {}

  @Get()
  async getAllThemes(@Req() req: any): Promise<Array<ThemesDto> | void> {
    if (req.user.username) {
      return await this.themesService.getAllThemes(req.user.username);
    } else {
      throw new UnauthorizedException();
    }
  }

  @Post()
  async insertTheme(@Req() req: any, @Body() theme: ThemesDto) {
    if (req.user.username) {
      if (theme.username === req.user.username) {
        theme.default = false;
        return await this.themesService.insertTheme(theme);
      } else {
        throw new ForbiddenException();
      }
    } else {
      throw new UnauthorizedException();
    }
  }

  @Put()
  async updateTheme(@Req() req: any, @Body() theme: ThemesDto) {
    if (req.user.username) {
      if (theme.username === req.user.username) {
        theme.default = false;
        return await this.themesService.updateTheme(theme);
      } else {
        throw new ForbiddenException();
      }
    } else {
      throw new UnauthorizedException();
    }
  }

  @Delete()
  async deleteTheme(@Req() req: any, @Param('key') key: string) {
    if (req.user.username) {
      return await this.themesService.deleteTheme(key, req.user.username);
    } else {
      throw new UnauthorizedException();
    }
  }
}
