import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  StreamableFile,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from 'server/auth/guards/admin.guard';
import { AdminService } from './admin.service';
import { LogsDto } from './dto/logs.dto';
import { Private } from 'server/auth/decorators/private.decorator';
import { InfoDto } from './dto/info.dto';
import { UserDto } from 'server/user/user.dto';
import { UserprofileDto } from 'server/user/dto/userprofile.dto';

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
