import { StreamableFile } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Private } from 'server/auth/decorators/private.decorator';
import { AdminGuard } from 'server/auth/guards/admin.guard';
import { UserprofileDto } from 'server/user/dto/userprofile.dto';
import { UserDto } from 'server/user/user.dto';
import { AdminService } from './admin.service';
import { InfoDto } from './dto/info.dto';
import { LogsDto } from './dto/logs.dto';
import { ServerSettingsDto } from './dto/server-settings.dto';

@ApiTags('Admin')
@UseGuards(AdminGuard)
@Private()
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('info')
  getInfo(): Promise<InfoDto> {
    return this.adminService.getInfo();
  }

  @Get('server-settings')
  getServerSettings(): Promise<ServerSettingsDto> {
    return this.adminService.getServerSettings();
  }

  @Post('server-settings')
  updateServerSettings(@Body() serverSettings: ServerSettingsDto): Promise<ServerSettingsDto> {
    return this.adminService.updateServerSettings(serverSettings);
  }

  @Get('logs')
  getLogs(): Promise<LogsDto> {
    return this.adminService.getLogs();
  }

  @Get('logs/:logFile')
  downloadLogFile(@Param('logFile') logFile: string): Promise<StreamableFile> {
    return this.adminService.dowloadLogFile(logFile);
  }

  @Get('blocked-videos')
  async findAll(): Promise<string[]> {
    return this.adminService.getAllBlockedVideoIds();
  }

  @Get('blocked-videos/:id')
  async isVideoBlocked(@Param('id') id: string): Promise<boolean> {
    return this.adminService.isVideoBlocked(id);
  }

  @Post('blocked-videos')
  async create(@Body() videoId: string): Promise<string> {
    return this.adminService.blockVideoId(videoId);
  }

  @Delete('blocked-videos/:id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.adminService.unblockVideoId(id);
  }

  @Post('users')
  async createUser(@Body() user: UserDto): Promise<UserprofileDto> {
    return this.adminService.createUser(user);
  }
}
