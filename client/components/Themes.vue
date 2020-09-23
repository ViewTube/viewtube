<template>
  <div class="popup">
    <div class="popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>Themes</h1>
      <ThemeSelector />
    </div>
    <div class="popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script>
import CloseIcon from 'vue-material-design-icons/Close';
import ThemeSelector from '@/components/themes/ThemeSelector';
import '@/assets/styles/popup.scss';

export default {
  name: 'Themes',
  components: {
    CloseIcon,
    ThemeSelector
  },
  data() {
    return {
      themes: this.$store.getters['theme/themes'],
      currentTheme: this.$store.getters['theme/theme']
    };
  },
  methods: {
    onThemeChange(element, index) {
      setTimeout(() => {
        document.body.classList.add('transition-all');
        this.$store.commit('theme/setTheme', element.value);
        setTimeout(() => {
          document.body.classList.remove('transition-all');
        }, 300);
      }, 300);
    }
  }
};
</script>

<style lang="scss"></style>
