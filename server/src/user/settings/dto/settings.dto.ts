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

  sponsorblockSegmentPreview: segmentOption;

  autoplay: boolean;

  saveVideoHistory: boolean;

  showHomeSubscriptions: boolean;

  alwaysLoopVideo: boolean;

  autoplayNextVideo: boolean;

  audioModeDefault: boolean;

  defaultVideoSpeed: number;

  defaultVideoQuality: string;

  defaultAudioQuality: string;

  autoAdjustAudioQuality: boolean;

  autoAdjustVideoQuality: boolean;

  dashPlaybackEnabled: boolean;
  
  rewriteYouTubeURLs: boolean;
}
