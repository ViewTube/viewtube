type segmentOption = 'skip' | 'ask' | 'none';

export class SponsorblockSettingsDto {
  enabled: boolean;
  sponsor: segmentOption;
  intro: segmentOption;
  outro: segmentOption;
  interaction: segmentOption;
  selfpromo: segmentOption;
  // eslint-disable-next-line camelcase
  music_offtopic: segmentOption;
}
