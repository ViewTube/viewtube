import { Controller, Delete, Get, Post, Put, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ThemeDto } from '../../../shared/dto/theme/theme.dto';
import { ThemeService } from './theme.service';

@ApiTags('User')
@Controller('user/theme')
export class ThemeController {
  constructor(private themeService: ThemeService) {}

  @Get('themes')
  @ApiOperation({ summary: 'Gets all themes owned by user' })
  getThemes(@Req() req: any): Promise<ThemeDto[]> {
    return this.themeService.getThemes(req);
  }

  @Post('theme')
  @ApiOperation({ summary: 'Adds a theme for the current user' })
  addTheme(@Req() req: any, theme: ThemeDto): Promise<boolean> {
    return this.themeService.addTheme(req, theme);
  }

  @Put('theme')
  @ApiOperation({ summary: 'Updates a theme for the current user' })
  updateTheme(@Req() req: any, theme: ThemeDto): Promise<boolean> {
    return this.themeService.updateTheme(req, theme);
  }

  @Delete('theme')
  @ApiOperation({ summary: 'Deletes a theme for the current user' })
  deleteTheme(@Req() req: any, theme: ThemeDto): Promise<boolean> {
    return this.themeService.deleteTheme(req, theme);
  }
}
