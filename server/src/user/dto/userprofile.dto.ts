import { SettingsDto } from '../settings/dto/settings.dto';

export class UserprofileDto {
  username: string;

  profileImage: string;

  settings: SettingsDto;

  admin?: boolean;
}
