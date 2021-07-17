import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StatisticsDto } from './dto/statistics.dto';
import { StatisticsService } from './statistics.service';

@ApiTags('Core')
@Controller('statistics')
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get()
  getStatistics(): Promise<StatisticsDto> {
    return this.statisticsService.getStatistics();
  }
}
