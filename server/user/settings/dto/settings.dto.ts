export type segmentOption = 'none' | 'ask' | 'skip';

export class SettingsDto {
  miniplayer: boolean;

  chapters: boolean;

  theme: string;

  sponsorblockEnabled: boolean;

  sponsorblockSegmentSponsor: segmentOption;

  sponsorblockSegmentIntro: segmentOption;

  sponsorblockSegmentOutro: segmentOption;

  sponsorblockSegmentInteraction: segmentOption;

  sponsorblockSegmentSelfpromo: segmentOption;

  sponsorblockSegmentMusicOfftopic: segmentOption;

  autoplay: boolean;

  saveVideoHistory: boolean;

  showHomeSubscriptions: boolean;

  alwaysLoopVideo: boolean;

  autoplayNextVideo: boolean;

  audioModeDefault: boolean;

  defaultVideoSpeed: number;
}
