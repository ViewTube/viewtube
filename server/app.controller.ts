import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from 'viewtube/server/app.service';
import { StatusDto } from './status.dto';

@ApiTags('Core')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/status')
  getStatus(): StatusDto {
    return this.appService.getStatus();
  }
}
