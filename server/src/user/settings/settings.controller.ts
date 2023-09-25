import { Controller, Body, Req, HttpCode, Put, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { SettingsDto } from './dto/settings.dto';
import { Private } from 'server/auth/decorators/private.decorator';

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
