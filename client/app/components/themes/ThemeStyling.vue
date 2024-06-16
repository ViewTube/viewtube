<template>
  <!-- prettier-ignore -->
  <component :is="'style'">
    :root { 
      --bgcolor-main: {{ currentTheme['bgcolor-main'] }};
      --bgcolor-alt: {{ currentTheme['bgcolor-alt'] }};
      --bgcolor-alt-light: {{ currentTheme['bgcolor-alt-light'] }};
      --bgcolor-translucent: {{ currentTheme['bgcolor-translucent'] }};
      --error-color-green: {{ currentTheme['error-color-green'] }};
      --error-color-red: {{ currentTheme['error-color-red'] }};
      --theme-color: {{ currentTheme['theme-color'] }};
      --theme-color-light: {{ currentTheme['theme-color-light'] }};
      --theme-color-dark: {{ currentTheme['theme-color-dark'] }};
      --theme-color-alt: {{ currentTheme['theme-color-alt'] }};
      --theme-color-translucent: {{ currentTheme['theme-color-translucent'] }};
      --line-color: {{ currentTheme['line-color'] }};
      --line-accent-color: {{ currentTheme['line-accent-color'] }};
      --line-accent-color-dark: {{ currentTheme['line-accent-color-dark'] }};
      --theme-color-gradient: {{ currentTheme['theme-color-gradient'] }};
      --shadow-load-color: {{ currentTheme['shadow-load-color'] }};
      --header-bgcolor: {{ currentTheme['header-bgcolor'] }};
      --header-transparent: {{ currentTheme['header-transparent'] }};
      --title-color: {{ currentTheme['title-color'] }};
      --subtitle-color: {{ currentTheme['subtitle-color'] }};
      --subtitle-color-light: {{ currentTheme['subtitle-color-light'] }};
      --darkness: {{ currentTheme['darkness'] }};
      --gradient-opacity: {{ currentTheme['gradient-opacity'] }};
    }

    html {
      {{ popupStore.popupOpen ? 'overflow: hidden;' : '' }}
    }
  </component>
</template>

<script lang="ts">
import { usePopupStore } from '~/store/popup';
import { useSettingsStore } from '~/store/settings';

export default defineComponent({
  name: 'ThemeStyling',
  setup() {
    const popupStore = usePopupStore();
    const { currentTheme } = useCurrentTheme();
    const settingsStore = useSettingsStore();

    const clientColorScheme = usePreferredColorScheme();

    watch(clientColorScheme, newVal => {
      switch (newVal) {
        case 'light':
          settingsStore.defaultTheme = 'light';
          break;
        case 'dark':
        default:
          settingsStore.defaultTheme = 'default';
          break;
      }
    });

    return {
      currentTheme,
      popupStore
    };
  }
});
</script>
