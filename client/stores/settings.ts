import { defineStore } from 'pinia';
import { insertSetters } from '@/utilities/storeSetters';

type SegmentOption = 'skip' | 'ask' | 'none';
type ThemeVariant = 'default' | 'light' | 'dark-no-gradient' | 'black' | 'green';

const state = {
  theme: 'default' as ThemeVariant,
  miniplayer: false,
  chapters: true,
  saveVideoHistory: true,
  settingsSaving: false,
  sponsorblockEnabled: true,
  sponsorblockSegmentSponsor: 'skip' as SegmentOption,
  sponsorblockSegmentIntro: 'ask' as SegmentOption,
  sponsorblockSegmentOutro: 'ask' as SegmentOption,
  sponsorblockSegmentInteraction: 'skip' as SegmentOption,
  sponsorblockSegmentSelfpromo: 'skip' as SegmentOption,
  sponsorblockSegmentMusicOfftopic: 'skip' as SegmentOption,
  sponsorblockSegmentPreview: 'skip' as SegmentOption,
  autoplay: false,
  alwaysLoopVideo: false,
  showHomeSubscriptions: true,
  autoplayNextVideo: false,
  audioModeDefault: false,
  defaultVideoSpeed: 1,
  defaultVideoQuality: '720p',
  defaultAudioQuality: '192kb',
  autoAdjustVideoQuality: true,
  autoAdjustAudioQuality: true,
  dashPlaybackEnabled: false,
  coolSetting: false
};

export const useSettingsStore = defineStore('settings', {
  state: () => state,

  actions: {
    updateSettings(newSettings: typeof state) {
      Object.keys(newSettings).forEach(key => {
        this[key] = newSettings[key];
      });
    },
    ...insertSetters(state)
  }
});
