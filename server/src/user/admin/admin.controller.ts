import { Controller, Get, Param, StreamableFile, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from 'server/auth/guards/admin.guard';
import { JwtAuthGuard } from 'server/auth/guards/jwt.guard';
import { AdminService } from './admin.service';
import { LogsDto } from './dto/logs.dto';

@ApiTags('Admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('logs')
  getLogs(): Promise<LogsDto> {
    return this.adminService.getLogs();
  }

  @Get('logs/:logFile')
  downloadLogFile(@Param('logFile') logFile: string): Promise<StreamableFile> {
    return this.adminService.dowloadLogFile(logFile);
  }
}
