import { Controller, UseGuards, Body, Req, HttpCode, Put, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'viewtube/server/auth/guards/jwt.guard';
import { SettingsService } from './settings.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SettingsDto } from './dto/settings.dto';

@ApiTags('User')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('user/settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @ApiBearerAuth()
  @Put()
  @HttpCode(204)
  setSettings(@Body() settings: Partial<SettingsDto>, @Req() request: any): Promise<void> {
    return this.settingsService.setSettings(settings, request.user.username);
  }

  @ApiBearerAuth()
  @Get()
  getSettings(@Req() request: any): Promise<SettingsDto> {
    return this.settingsService.getSettings(request.user.username);
  }
}
