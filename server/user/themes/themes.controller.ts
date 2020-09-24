import { Controller, Get } from '@nestjs/common';
import { ThemesDto } from './dto/themes.dto';
import { ThemesService } from './themes.service';

@Controller('user/themes')
export class ThemesController {
  constructor(private themesService: ThemesService) {}
  @Get()
  getAllThemes(): Promise<Array<ThemesDto> | void> {
    return this.themesService.getAllThemes('dummy');
  }
}
