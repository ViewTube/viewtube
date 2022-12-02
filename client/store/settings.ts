import { defineStore } from 'pinia';
import { insertSetters } from '@/utilities/storeSetters';
import { useUserStore } from '@/store/user';
import { UnwrapNestedRefs } from 'vue';

export type SegmentOption = 'skip' | 'ask' | 'none';
type ThemeVariant = 'default' | 'light' | 'dark-no-gradient' | 'black' | 'green';

export const useSettingsStore = defineStore('settings', () => {
  const state = toRefs(
    reactive({
      theme: 'default' as ThemeVariant,
      miniplayer: false,
      chapters: true,
      saveVideoHistory: true,
      settingsSaving: false,
      sponsorblockEnabled: true,
      sponsorblockSegmentSponsor: 'ask' as SegmentOption,
      sponsorblockSegmentIntro: 'ask' as SegmentOption,
      sponsorblockSegmentOutro: 'ask' as SegmentOption,
      sponsorblockSegmentInteraction: 'ask' as SegmentOption,
      sponsorblockSegmentSelfpromo: 'ask' as SegmentOption,
      sponsorblockSegmentMusicOfftopic: 'ask' as SegmentOption,
      sponsorblockSegmentPreview: 'ask' as SegmentOption,
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
      await $fetch(`${apiUrl}user/settings`, {
        method: 'PUT',
        credentials: 'include',
        // Use reactive to unwrap properties
        body: reactive(state)
      });
    }
    state.settingsSaving.value = false;
  };

  const setters = insertSetters(state, storeSettings);

  return {
    ...state,
    ...setters,
    updateSettings,
    storeSettings,
    persist: true
  };
});
