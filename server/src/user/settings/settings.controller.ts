import { Body, Controller, Get, HttpCode, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Private } from 'server/auth/decorators/private.decorator';
import type { SettingsDto } from './dto/settings.dto';
import type { SettingsService } from './settings.service';

@ApiTags('User')
@ApiBearerAuth()
@Private()
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
