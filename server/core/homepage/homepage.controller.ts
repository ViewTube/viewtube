import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PopularDto } from './dto/popular.dto';
import { HomepageService } from './homepage.service';

@ApiTags('Core')
@Controller('homepage')
export class HomepageController {
  constructor(private homepageService: HomepageService) {}

  @Get('popular')
  getPopular(): Promise<PopularDto> {
    return this.homepageService.getPopular();
  }
}
