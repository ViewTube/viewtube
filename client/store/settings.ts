import { defineStore } from 'pinia';
import { useUserStore } from '@/store/user';
import { UnwrapNestedRefs } from 'vue';

export type SegmentOption = 'skip' | 'ask' | 'none';
type ThemeVariant = 'default' | 'light' | 'dark-no-gradient' | 'black' | 'green';

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const state = toRefs(
      reactive({
        alwaysLoopVideo: false,
        audioModeDefault: false,
        autoAdjustAudioQuality: true,
        autoAdjustVideoQuality: true,
        autoplay: false,
        autoplayNextVideo: false,
        chapters: true,
        dashPlaybackEnabled: false,
        defaultAudioQuality: '192kb',
        defaultVideoQuality: '720p',
        defaultVideoSpeed: 1,
        miniplayer: false,
        saveVideoHistory: true,
        settingsSaving: false,
        showHomeSubscriptions: true,
        sponsorblockEnabled: true,
        sponsorblockSegmentInteraction: 'ask' as SegmentOption,
        sponsorblockSegmentIntro: 'ask' as SegmentOption,
        sponsorblockSegmentMusicOfftopic: 'ask' as SegmentOption,
        sponsorblockSegmentOutro: 'ask' as SegmentOption,
        sponsorblockSegmentPreview: 'ask' as SegmentOption,
        sponsorblockSegmentSelfpromo: 'ask' as SegmentOption,
        sponsorblockSegmentSponsor: 'ask' as SegmentOption,
        theme: 'default' as ThemeVariant
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
          credentials: 'include',
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
  { persist: true }
);
