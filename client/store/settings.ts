import { getterTree, mutationTree } from 'typed-vuex';
import { declareActionTree } from '@/plugins/actionTree.shim';

type segmentOption = 'skip' | 'ask' | 'none';

export const state = () => ({
  theme: 'default',
  defaults: {
    theme: [
      {
        value: 'default',
        name: 'Dark theme',
        'bgcolor-main': '#121212',
        'bgcolor-alt': '#1a1a1a',
        'bgcolor-alt-light': '#484848',
        'bgcolor-translucent': '#0000007c',
        'error-color-green': '#4caf50',
        'error-color-red': '#d93025',
        'theme-color': '#ff7b3a',
        'theme-color-light': '#f5af19',
        'theme-color-dark': '#f12711',
        'theme-color-alt': '#108dc7',
        'theme-color-translucent': '#ff7b3a80',
        'line-color': 'rgba(255, 255, 255, 0.2)',
        'line-accent-color': 'rgba(255, 255, 255, 0.4)',
        'theme-color-gradient': `linear-gradient(
            53deg,
            rgba(241, 87, 10, 1) 0%,
            rgba(224, 140, 112, 1) 33%,
            rgba(89, 193, 186, 1) 78%,
            rgba(0, 212, 255, 1) 100%
          )`,
        'shadow-load-color': '#535353b6',
        'header-bgcolor': '#272727',
        'header-transparent': '#00000000',
        'title-color': '#ebebeb',
        'subtitle-color': '#d8d8d8',
        'subtitle-color-light': '#b3b3b3',
        darkness: 'invert(90%)',
        'gradient-opacity': 1
      },
      {
        value: 'light',
        name: 'Light theme',
        'bgcolor-main': '#ffffff',
        'bgcolor-alt': '#ffffff',
        'bgcolor-alt-light': '#dadada',
        'bgcolor-translucent': '#ffffff7c',
        'error-color-green': '#4caf50',
        'error-color-red': '#d93025',
        'theme-color': '#ff7b3a',
        'theme-color-light': '#f5af19',
        'theme-color-dark': '#f12711',
        'theme-color-alt': '#108dc7',
        'theme-color-translucent': '#ff7b3a80',
        'line-color': 'rgba(255, 255, 255, 0.2)',
        'line-accent-color': 'rgba(255, 255, 255, 0.4)',
        'theme-color-gradient': `linear-gradient(
            53deg,
            rgba(241, 87, 10, 1) 0%,
            rgba(224, 140, 112, 1) 33%,
            rgba(89, 193, 186, 1) 78%,
            rgba(0, 212, 255, 1) 100%
          )`,
        'shadow-load-color': '#535353b6',
        'header-bgcolor': '#fffffff2',
        'header-transparent': '#ffffff',
        'title-color': '#080808',
        'subtitle-color': '#333333',
        'subtitle-color-light': '#4e4e4e',
        darkness: 'invert(0%)',
        'gradient-opacity': 0
      },
      {
        value: 'dark-no-gradient',
        name: 'Dark theme without background gradients',
        'bgcolor-main': '#121212',
        'bgcolor-alt': '#1a1a1a',
        'bgcolor-alt-light': '#484848',
        'bgcolor-translucent': '#0000007c',
        'error-color-green': '#4caf50',
        'error-color-red': '#d93025',
        'theme-color': '#ff7b3a',
        'theme-color-light': '#f5af19',
        'theme-color-dark': '#f12711',
        'theme-color-alt': '#108dc7',
        'theme-color-translucent': '#ff7b3a80',
        'line-color': 'rgba(255, 255, 255, 0.2)',
        'line-accent-color': 'rgba(255, 255, 255, 0.4)',
        'theme-color-gradient': `linear-gradient(
          53deg,
          rgba(241, 87, 10, 1) 0%,
          rgba(224, 140, 112, 1) 33%,
          rgba(89, 193, 186, 1) 78%,
          rgba(0, 212, 255, 1) 100%
        )`,
        'shadow-load-color': '#535353b6',
        'header-bgcolor': '#272727',
        'header-transparent': '#00000000',
        'title-color': '#ebebeb',
        'subtitle-color': '#d8d8d8',
        'subtitle-color-light': '#b3b3b3',
        darkness: 'invert(90%)',
        'gradient-opacity': 0
      },
      {
        value: 'black',
        name: 'Black theme',
        'bgcolor-main': '#000000',
        'bgcolor-alt': '#1a1a1a',
        'bgcolor-alt-light': '#484848',
        'bgcolor-translucent': '#0000007c',
        'error-color-green': '#4caf50',
        'error-color-red': '#d93025',
        'theme-color': '#ff7b3a',
        'theme-color-light': '#f5af19',
        'theme-color-dark': '#f12711',
        'theme-color-alt': '#108dc7',
        'theme-color-translucent': '#ff7b3a80',
        'line-color': 'rgba(255, 255, 255, 0.2)',
        'line-accent-color': 'rgba(255, 255, 255, 0.4)',
        'theme-color-gradient': `linear-gradient(
          53deg,
          rgba(241, 87, 10, 1) 0%,
          rgba(224, 140, 112, 1) 33%,
          rgba(89, 193, 186, 1) 78%,
          rgba(0, 212, 255, 1) 100%
        )`,
        'shadow-load-color': '#535353b6',
        'header-bgcolor': '#272727',
        'header-transparent': '#00000000',
        'title-color': '#ebebeb',
        'subtitle-color': '#d8d8d8',
        'subtitle-color-light': '#b3b3b3',
        darkness: 'invert(100%)',
        'gradient-opacity': 1
      },
      {
        value: 'green',
        name: 'Dark green theme',
        'bgcolor-main': '#121212',
        'bgcolor-alt': '#1a1a1a',
        'bgcolor-alt-light': '#484848',
        'bgcolor-translucent': '#0000007c',
        'error-color-green': '#4caf50',
        'error-color-red': '#d93025',
        'theme-color': '#06b300',
        'theme-color-light': '#60c25c',
        'theme-color-dark': '#1da019',
        'theme-color-alt': '#108dc7',
        'theme-color-translucent': '#06b30080',
        'line-color': 'rgba(255, 255, 255, 0.2)',
        'line-accent-color': 'rgba(255, 255, 255, 0.4)',
        'theme-color-gradient': `linear-gradient(
            53deg,
            rgba(6, 179, 0, 1) 0%,
            rgb(104, 207, 101) 33%,
            rgba(89, 193, 186, 1) 78%,
            rgba(0, 212, 255, 1) 100%
          )`,
        'shadow-load-color': '#535353b6',
        'header-bgcolor': '#272727',
        'header-transparent': '#00000000',
        'title-color': '#ebebeb',
        'subtitle-color': '#d8d8d8',
        'subtitle-color-light': '#b3b3b3',
        darkness: 'invert(100%)',
        'gradient-opacity': 0
      }
    ]
  },
  miniplayer: false,
  chapters: true,
  saveVideoHistory: true,
  settingsSaving: false,
  sponsorblockEnabled: true,
  sponsorblockSegmentSponsor: 'skip' as segmentOption,
  sponsorblockSegmentIntro: 'ask' as segmentOption,
  sponsorblockSegmentOutro: 'ask' as segmentOption,
  sponsorblockSegmentInteraction: 'skip' as segmentOption,
  sponsorblockSegmentSelfpromo: 'skip' as segmentOption,
  sponsorblockSegmentMusicOfftopic: 'skip' as segmentOption,
  sponsorblockSegmentPreview: 'skip' as segmentOption,
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
});

export const getters = getterTree(state, {
  theme: state => state.theme,
  defaultThemes: state => state.defaults.theme,
  miniplayer: state => state.miniplayer,
  chapters: state => state.chapters,
  themeVariables: state => state.defaults.theme.find(el => state.theme === el.value),
  saveVideoHistory: state => state.saveVideoHistory,
  sponsorblockEnabled: state => state.sponsorblockEnabled,
  sponsorblockSegmentSponsor: state => state.sponsorblockSegmentSponsor,
  sponsorblockSegmentIntro: state => state.sponsorblockSegmentIntro,
  sponsorblockSegmentOutro: state => state.sponsorblockSegmentOutro,
  sponsorblockSegmentInteraction: state => state.sponsorblockSegmentInteraction,
  sponsorblockSegmentSelfpromo: state => state.sponsorblockSegmentSelfpromo,
  sponsorblockSegmentMusicOfftopic: state => state.sponsorblockSegmentMusicOfftopic,
  sponsorblockSegmentPreview: state => state.sponsorblockSegmentPreview,
  autoplay: state => state.autoplay,
  alwaysLoopVideo: state => state.alwaysLoopVideo,
  showHomeSubscriptions: state => state.showHomeSubscriptions,
  autoplayNextVideo: state => state.autoplayNextVideo,
  audioModeDefault: state => state.audioModeDefault,
  defaultVideoSpeed: state => state.defaultVideoSpeed,
  defaultVideoQuality: state => state.defaultVideoQuality,
  defaultAudioQuality: state => state.defaultAudioQuality,
  autoAdjustVideoQuality: state => state.autoAdjustVideoQuality,
  autoAdjustAudioQuality: state => state.autoAdjustAudioQuality,
  dashPlaybackEnabled: state => state.dashPlaybackEnabled
});

export const mutations = mutationTree(state, {
  mutateSettings(state, newSettings) {
    Object.keys(newSettings).forEach((key: string) => {
      state[key] = newSettings[key];
    });
  },
  mutateSettingsSaving(state, saving: boolean) {
    state.settingsSaving = saving;
  },
  mutateTheme(state, theme) {
    if (state.defaults.theme.find(e => e.value === theme)) {
      state.theme = theme;
    }
  },
  mutateMiniplayer(state, enabled: boolean) {
    state.miniplayer = enabled;
  },
  mutateChapters(state, enabled: boolean) {
    state.chapters = enabled;
  },
  mutateSponsorblock(state, enabled: boolean) {
    state.sponsorblockEnabled = enabled;
  },
  mutateSaveVideoHistory(state, enabled: boolean) {
    state.saveVideoHistory = enabled;
  },
  mutateSponsorblockCategoryStatus(state, { category, status }) {
    if (state[`sponsorblockSegment${category}`]) {
      if (status === 'skip' || status === 'ask' || status === 'none') {
        state[`sponsorblockSegment${category}`] = status;
      }
    }
  },
  mutateAutoplay(state, enabled: boolean) {
    state.autoplay = enabled;
  },
  mutateAlwaysLoopVideo(state, enabled: boolean) {
    state.alwaysLoopVideo = enabled;
  },
  mutateShowHomeSubscriptions(state, enabled: boolean) {
    state.showHomeSubscriptions = enabled;
  },
  mutateAutoplayNextVideo(state, enabled: boolean) {
    state.autoplayNextVideo = enabled;
  },
  mutateAudioModeDefault(state, enabled: boolean) {
    state.audioModeDefault = enabled;
  },
  mutateDefaultVideoSpeed(state, speed: number) {
    state.defaultVideoSpeed = speed;
  },
  mutateDefaultVideoQuality(state, quality: string) {
    state.defaultVideoQuality = quality;
  },
  mutateDefaultAudioQuality(state, quality: string) {
    state.defaultAudioQuality = quality;
  },
  mutateAutoAdjustVideoQuality(state, value: boolean) {
    state.autoAdjustVideoQuality = value;
  },
  mutateAutoAdjustAudioQuality(state, value: boolean) {
    state.autoAdjustAudioQuality = value;
  },
  mutateDashPlaybackEnabled(state, value: boolean) {
    state.dashPlaybackEnabled = value;
  }
});

export const actions = declareActionTree(
  { state, getters, mutations },
  {
    async setTheme({ commit, dispatch }, theme) {
      commit('mutateTheme', theme);
      await dispatch('doSettingsRequest', { settingsKey: 'theme', value: theme });
    },
    async setChapters({ commit, dispatch }, enabled) {
      commit('mutateChapters', enabled);
      await dispatch('doSettingsRequest', { settingsKey: 'chapters', value: enabled });
    },
    async setMiniplayer({ commit, dispatch }, enabled) {
      commit('mutateMiniplayer', enabled);
      await dispatch('doSettingsRequest', { settingsKey: 'miniplayer', value: enabled });
    },
    async setSponsorblock({ commit, dispatch }, enabled) {
      commit('mutateSponsorblock', enabled);
      await dispatch('storeSponsorblock');
    },
    async setSaveVideoHistory({ commit, dispatch }, enabled) {
      commit('mutateSaveVideoHistory', enabled);
      await dispatch('doSettingsRequest', { settingsKey: 'saveVideoHistory', value: enabled });
    },
    async setAutoplay({ commit, dispatch }, enabled: boolean) {
      commit('mutateAutoplay', enabled);
      await dispatch('doSettingsRequest', { settingsKey: 'autoplay', value: enabled });
    },
    async setAlwaysLoopVideo({ commit, dispatch }, enabled: boolean) {
      commit('mutateAlwaysLoopVideo', enabled);
      await dispatch('doSettingsRequest', { settingsKey: 'alwaysLoopVideo', value: enabled });
    },
    async setShowHomeSubscriptions({ commit, dispatch }, enabled: boolean) {
      commit('mutateShowHomeSubscriptions', enabled);
      await dispatch('doSettingsRequest', { settingsKey: 'showHomeSubscriptions', value: enabled });
    },
    async setAutoplayNextVideo({ commit, dispatch }, enabled: boolean) {
      commit('mutateAutoplayNextVideo', enabled);
      await dispatch('doSettingsRequest', { settingsKey: 'autoplayNextVideo', value: enabled });
    },
    async setAudioModeDefault({ commit, dispatch }, enabled: boolean) {
      commit('mutateAudioModeDefault', enabled);
      await dispatch('doSettingsRequest', { settingsKey: 'audioModeDefault', value: enabled });
    },
    async setDefaultVideoSpeed({ commit, dispatch }, speed: number) {
      let videoSpeed = speed;
      if (videoSpeed > 3) {
        videoSpeed = 3;
      }
      if (videoSpeed < 0.1) {
        videoSpeed = 0.1;
      }
      commit('mutateDefaultVideoSpeed', videoSpeed);
      await dispatch('doSettingsRequest', { settingsKey: 'defaultVideoSpeed', value: videoSpeed });
    },
    async setDefaultVideoQuality({ commit, dispatch }, quality: string) {
      commit('mutateDefaultVideoQuality', quality);
      await dispatch('doSettingsRequest', { settingsKey: 'defaultVideoQuality', value: quality });
    },
    async setDefaultAudioQuality({ commit, dispatch }, quality: string) {
      commit('mutateDefaultAudioQuality', quality);
      await dispatch('doSettingsRequest', { settingsKey: 'defaultAudioQuality', value: quality });
    },
    async setAutoAdjustVideoQuality({ commit, dispatch }, value: boolean) {
      commit('mutateAutoAdjustVideoQuality', value);
      await dispatch('doSettingsRequest', { settingsKey: 'autoAdjustVideoQuality', value });
    },
    async setAutoAdjustAudioQuality({ commit, dispatch }, value: boolean) {
      commit('mutateAutoAdjustAudioQuality', value);
      await dispatch('doSettingsRequest', { settingsKey: 'autoAdjustAudioQuality', value });
    },
    async setDashPlaybackEnabled({ commit, dispatch }, value: boolean) {
      commit('mutateDashPlaybackEnabled', value);
      await dispatch('doSettingsRequest', { settingsKey: 'dashPlaybackEnabled', value });
    },
    async storeSponsorblock({ getters }) {
      await this.$axios.put(
        `${this.app.$accessor.environment.env.apiUrl}user/settings`,
        {
          sponsorblockEnabled: getters.sponsorblockEnabled,
          sponsorblockSegmentInteraction: getters.sponsorblockSegmentInteraction,
          sponsorblockSegmentIntro: getters.sponsorblockSegmentIntro,
          sponsorblockSegmentMusicOfftopic: getters.sponsorblockSegmentMusicOfftopic,
          sponsorblockSegmentOutro: getters.sponsorblockSegmentOutro,
          sponsorblockSegmentSelfpromo: getters.sponsorblockSegmentSelfpromo,
          sponsorblockSegmentSponsor: getters.sponsorblockSegmentSponsor,
          sponsorblockSegmentPreview: getters.sponsorblockSegmentPreview
        },
        { withCredentials: true }
      );
    },
    async doSettingsRequest(_, { settingsKey, value }): Promise<void> {
      if (this.app.$accessor.user.isLoggedIn) {
        const setting = {};
        setting[settingsKey] = value;
        await this.$axios.put(
          `${this.app.$accessor.environment.env.apiUrl}user/settings`,
          setting,
          { withCredentials: true }
        );
      }
    }
  }
);
