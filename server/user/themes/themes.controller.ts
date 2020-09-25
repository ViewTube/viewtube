import { Controller, Get, UseGuards, Req, Put, Body } from '@nestjs/common';
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

  @Get('allThemes')
  async getAllThemes(@Req() req: any): Promise<Array<ThemesDto> | void> {
    return await this.themesService.getAllThemes(req.user.username);
  }

  @Put('insert')
  async insertTheme(@Req() req: any, @Body() theme: ThemesDto) {
    theme.username = req.user.username;
    this.themesService.insertTheme(theme);
  }

  @Put('update')
  async updateTheme(@Req() req: any, @Body() theme: ThemesDto) {
    if (theme.username === req.user.username) {
      this.themesService.updateTheme(theme);
      req.status(200).send();
    } else {
      req.status(403).send();
    }
  }
}
