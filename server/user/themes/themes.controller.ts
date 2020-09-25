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
  NotFoundException,
  Delete
} from '@nestjs/common';
import { ThemesDto } from './dto/themes.dto';
import { ThemesService } from './themes.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'server/auth/guards/jwt.guard';

@ApiTags('User')
@Controller('user/themes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ThemesController {
  constructor(private themesService: ThemesService) {}

  @Get()
  async getAllThemes(@Req() req: any): Promise<Array<ThemesDto> | void> {
    return await this.themesService.getAllThemes(req.user.username);
  }

  @Post()
  async insertTheme(@Req() req: any, @Body() theme: ThemesDto) {
    if (theme.username === req.user.username) {
      this.themesService.insertTheme(theme);
    } else {
      throw new UnauthorizedException();
    }
  }

  @Put()
  async updateTheme(@Req() req: any, @Body() theme: ThemesDto) {
    if (theme.username === req.user.username) {
      this.themesService.updateTheme(theme);
    } else {
      throw new UnauthorizedException();
    }
  }

  @Delete()
  async deleteTheme(@Req() req: any, @Param('key') key: string) {
    if (!this.themesService.deleteTheme(key, req.user.username)) {
      throw new NotFoundException();
    }
  }
}
