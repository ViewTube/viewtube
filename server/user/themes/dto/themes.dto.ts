import { ThemeVariableType } from 'server/user/themes/dto/theme-variables.dto';
export class ThemesDto {
  username: string;
  default: boolean;
  key: string;
  name: string;
  variables: ThemeVariableType[];
}
