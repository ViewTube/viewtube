import { ThemesDto } from './dto/themes.dto';

export class ThemesService {
  async getAllThemes(username: string): Promise<Array<ThemesDto> | void> {
    return [];
  }
}
