<template>
  <style>
    :root {
      --bgcolor-main: {{ getTheme()['bgcolor-main'] }};
      --bgcolor-alt: {{ getTheme()['bgcolor-alt'] }};
      --bgcolor-alt-light: {{ getTheme()['bgcolor-alt-light'] }};
      --bgcolor-translucent: {{ getTheme()['bgcolor-translucent'] }};
      --error-color-green: {{ getTheme()['error-color-green'] }};
      --error-color-red: {{ getTheme()['error-color-red'] }};
      --theme-color: {{ getTheme()['theme-color'] }};
      --theme-color-light: {{ getTheme()['theme-color-light'] }};
      --theme-color-dark: {{ getTheme()['theme-color-dark'] }};
      --theme-color-alt: {{ getTheme()['theme-color-alt'] }};
      --theme-color-translucent: {{ getTheme()['theme-color-translucent'] }};
      --line-color: {{ getTheme()['line-color'] }};
      --line-accent-color: {{ getTheme()['line-accent-color'] }};
      --theme-color-gradient: {{ getTheme()['theme-color-gradient'] }};
      --shadow-load-color: {{ getTheme()['shadow-load-color'] }};
      --header-bgcolor: {{ getTheme()['header-bgcolor'] }};
      --header-transparent: {{ getTheme()['header-transparent'] }};
      --title-color: {{ getTheme()['title-color'] }};
      --subtitle-color: {{ getTheme()['subtitle-color'] }};
      --subtitle-color-light: {{ getTheme()['subtitle-color-light'] }};
      --darkness: {{ getTheme()['darkness'] }};
      --gradient-opacity: {{ getTheme()['gradient-opacity'] }};
    }
  </style>
</template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api';
import { useAccessor } from '@/store';

export default defineComponent({
  name: 'ThemeStyling',
  setup() {
    const accessor = useAccessor();
    const theme = ref(accessor.settings.themeVariables);

    const getTheme = (): any => {
      return accessor.settings.themeVariables;
    };

    return {
      theme,
      getTheme
    };
  }
});
</script>
