import { useUserStore } from '~/store/user';
import destr from 'destr';
import { defineStore } from 'pinia';
import { type UnwrapNestedRefs } from 'vue';

export type SegmentOption = 'skip' | 'ask' | 'none';
type ThemeVariant = 'default' | 'light' | 'black' | 'green';

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const { vtFetch } = useVtFetch();

    const serverColorScheme = useRequestHeaders(['Sec-CH-Prefers-Color-Scheme']);
    let defaultTheme = 'default' as ThemeVariant;
    if (serverColorScheme?.['sec-ch-prefers-color-scheme']) {
      switch (serverColorScheme['sec-ch-prefers-color-scheme']) {
        case 'dark':
          defaultTheme = 'default';
          break;
        case 'light':
          defaultTheme = 'light';
          break;
      }
    }

    const state = toRefs(
      reactive({
        alwaysLoopVideo: false,
        hideComments: false,
        videoSpeedAsList: false,
        audioModeDefault: false,
        autoAdjustAudioQuality: true,
        autoAdjustVideoQuality: true,
        autoplay: false,
        autoplayNextVideo: false,
        chapters: true,
        defaultAudioQuality: '192kb',
        maxVideoQuality: '1080p',
        defaultVideoSpeed: 1,
        saveVideoHistory: true,
        settingsSaving: false,
        showHomeSubscriptions: true,
        showHomeTrendingVideos: true,
        showRecommendedVideos: true,
        sponsorblockEnabled: true,
        sponsorblockUrl: 'https://sponsor.ajay.app/',
        sponsorblockSegmentInteraction: 'ask' as SegmentOption,
        sponsorblockSegmentIntro: 'ask' as SegmentOption,
        sponsorblockSegmentMusicOfftopic: 'ask' as SegmentOption,
        sponsorblockSegmentOutro: 'ask' as SegmentOption,
        sponsorblockSegmentPreview: 'ask' as SegmentOption,
        sponsorblockSegmentSelfpromo: 'ask' as SegmentOption,
        sponsorblockSegmentSponsor: 'ask' as SegmentOption,
        sponsorblockSegmentFiller: 'none' as SegmentOption,
        theme: null as ThemeVariant | null,
        defaultTheme: defaultTheme as ThemeVariant,
        rewriteYouTubeURLs: false,
        hideShortsFromSearch: false
      })
    );

    type StateType = UnwrapNestedRefs<typeof state>;

    const updateSettings = (newSettings: Partial<StateType>) => {
      Object.keys(newSettings).forEach((key: keyof Partial<StateType>) => {
        state[key].value = newSettings[key];
      });
    };

    const storeSettings = async () => {
      state.settingsSaving.value = true;

      const { apiUrl } = useApiUrl();
      const userStore = useUserStore();

      if (userStore.isLoggedIn) {
        // Use reactive to unwrap properties
        const { settingsSaving: _, ...settingsToSave } = reactive(state);
        await vtFetch(`${apiUrl.value}user/settings`, {
          method: 'PUT',
          body: settingsToSave
        });
      }
      state.settingsSaving.value = false;
    };

    const setters = insertSetters(state, storeSettings);

    return {
      ...state,
      ...setters,
      updateSettings,
      storeSettings
    };
  },
  {
    persist: {
      serializer: {
        deserialize: destr,
        serialize: JSON.stringify
      }
    }
  }
);
