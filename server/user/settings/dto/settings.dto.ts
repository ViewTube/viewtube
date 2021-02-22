import { SponsorblockSettingsDto } from './sponsorblock-settings.dto';

export class SettingsDto {
  miniplayer: boolean;

  chapters: boolean;

  theme: string;

  sponsorblock: SponsorblockSettingsDto;

  autoplay: boolean;

  saveVideoHistory: boolean;
}
