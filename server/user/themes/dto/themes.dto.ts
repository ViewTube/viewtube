export type ThemeVariableType = [string, string];

export class ThemesDto {
  username: string;
  key: string;
  name: string;
  variables: ThemeVariableType[];
}
