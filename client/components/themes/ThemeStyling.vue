<template>
  <style>
    :root {
      --bgcolor-main: {{ getTheme().themeVariables['bgcolor-main'] }};
      --bgcolor-alt: {{ getTheme().themeVariables['bgcolor-alt'] }};
      --bgcolor-alt-light: {{ getTheme().themeVariables['bgcolor-alt-light'] }};
      --bgcolor-translucent: {{ getTheme().themeVariables['bgcolor-translucent'] }};
      --error-color-green: {{ getTheme().themeVariables['error-color-green'] }};
      --error-color-red: {{ getTheme().themeVariables['error-color-red'] }};
      --theme-color: {{ getTheme().themeVariables['theme-color'] }};
      --theme-color-light: {{ getTheme().themeVariables['theme-color-light'] }};
      --theme-color-dark: {{ getTheme().themeVariables['theme-color-dark'] }};
      --theme-color-alt: {{ getTheme().themeVariables['theme-color-alt'] }};
      --theme-color-translucent: {{ getTheme().themeVariables['theme-color-translucent'] }};
      --line-color: {{ getTheme().themeVariables['line-color'] }};
      --line-accent-color: {{ getTheme().themeVariables['line-accent-color'] }};
      --theme-color-gradient: {{ getTheme().themeVariables['theme-color-gradient'] }};
      --shadow-load-color: {{ getTheme()['shadow-load-color'] }};
      --header-bgcolor: {{ getTheme().themeVariables['header-bgcolor'] }};
      --header-transparent: {{ getTheme().themeVariables['header-transparent'] }};
      --title-color: {{ getTheme().themeVariables['title-color'] }};
      --subtitle-color: {{ getTheme().themeVariables['subtitle-color'] }};
      --subtitle-color-light: {{ getTheme().themeVariables['subtitle-color-light'] }};
      --darkness: {{ getTheme().themeVariables['darkness'] }};
      --gradient-opacity: {{ getTheme().themeVariables['gradient-opacity'] }};
    }
  </style>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  data() {
    return {
      theme: this.$store.getters['theme/themeVariables']
    };
  },
  methods: {
    getTheme(): any {
      return this.$store.getters['theme/themeVariables'];
    }
  }
});
</script>
