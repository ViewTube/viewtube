export type ThemeVariableType = [string, string];

export class ThemesDto {
  username?: string;
  default?: boolean;
  key: string;
  name: string;
  variables: ThemeVariableType[];
}
