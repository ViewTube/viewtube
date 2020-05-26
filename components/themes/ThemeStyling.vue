<template>
  <style>
  :root {
    --bgcolor-main: {{ theme['bgcolor-main'] }};
    --bgcolor-alt: {{ theme['bgcolor-alt'] }};
    --bgcolor-alt-light: {{ theme['bgcolor-alt-light'] }};
    --bgcolor-translucent: {{ theme['bgcolor-translucent'] }};
    --error-color-green: {{ theme['error-color-green'] }};
    --error-color-red: {{ theme['error-color-red'] }};
    --theme-color: {{ theme['theme-color'] }};
    --theme-color-light: {{ theme['theme-color-light'] }};
    --theme-color-dark: {{ theme['theme-color-dark'] }};
    --theme-color-alt: {{ theme['theme-color-alt'] }};
    --theme-color-translucent: {{ theme['theme-color-translucent'] }};
    --line-color: {{ theme['line-color'] }};
    --line-accent-color: {{ theme['line-accent-color'] }};
    --theme-color-gradient: {{ theme['theme-color-gradient'] }};
    --shadow-load-color: {{ theme['shadow-load-color'] }};
    --header-bgcolor: {{ theme['header-bgcolor'] }};
    --header-transparent: {{ theme['header-transparent'] }};
    --title-color: {{ theme['title-color'] }};
    --subtitle-color: {{ theme['subtitle-color'] }};
    --subtitle-color-light: {{ theme['subtitle-color-light'] }};
    --darkness: {{ theme['darkness'] }};
    --gradient-opacity: {{ theme['gradient-opacity'] }};
  }
  </style>
</template>

<script>
export default {
  data() {
    return {
      theme: this.$store.getters['settings/theme']
    }
  }
}
</script>
