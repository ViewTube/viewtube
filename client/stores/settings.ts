import { UnwrapRef } from 'vue-demi';
import { defineStore } from 'pinia';

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
  dashPlaybackEnabled: false
};

const generateSetters = () => {};

type SetterType<Key = string> = `${Key}`

type SetActionsType<T> = {
  [Key in keyof T as Key extends `_${infer I}` ? I : Key]: T[Key];
};

type NewType = SetActionsType<typeof state>

const setActions = {};

for (const [key, value] of Object.entries(state)) {
  if (typeof value === 'boolean') {
    setActions[`set${key.charAt(0).toUpperCase()}${key.slice(1)}`] = function (
      this: UnwrapRef<typeof state>,
      enabled: boolean
    ) {
      this[key] = enabled;
    };
  }
}

console.log(setActions);

export const useSettingsStore = defineStore('settings', {
  state: () => state,

  getters: {},

  actions: {
    updateSettings(newSettings: typeof state) {
      Object.keys(newSettings).forEach(key => {
        this[key] = newSettings[key];
      });
    },
    setSettingsSaving(saving: boolean) {
      this.settingsSaving = saving;
    },
    setTheme(theme: ThemeVariant) {
      this.theme = theme;
    },
    setMiniplayerEnabled(enabled: boolean);
  }
});
