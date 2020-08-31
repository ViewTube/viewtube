import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { StatusDto } from './status.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Core')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('status')
  getStatus(): StatusDto {
    return this.appService.getStatus();
  }
}
