<template>
  <div class="settings popup">
    <div class="settings-container popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>Settings</h1>
      <h2><ThemeIcon />Theme</h2>
      <ThemeSelector />
      <h2><MiniplayerIcon />Miniplayer</h2>
      <SwitchButton
        :value="$store.getters['settings/miniplayer']"
        :label="'Enable miniplayer'"
        :disabled="false"
        @valuechange="val => $store.commit('settings/setMiniplayer', val)"
      />
    </div>
    <div class="settings-overlay popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script lang="ts">
import CloseIcon from 'vue-material-design-icons/Close.vue';
import ThemeIcon from 'vue-material-design-icons/Brightness4.vue';
import MiniplayerIcon from 'vue-material-design-icons/WindowRestore.vue';
import ThemeSelector from '@/components/themes/ThemeSelector.vue';
import SwitchButton from '@/components/buttons/SwitchButton.vue';
import '@/assets/styles/popup.scss';
import Vue from 'vue';

export default Vue.extend({
  name: 'Settings',
  components: {
    CloseIcon,
    ThemeIcon,
    MiniplayerIcon,
    SwitchButton,
    ThemeSelector
  },
  data() {
    return {
      themes: this.$store.getters['settings/defaultThemes'],
      currentTheme: this.$store.getters['settings/theme']
    };
  },
  methods: {
    onThemeChange(element: any) {
      setTimeout(() => {
        document.body.classList.add('transition-all');
        this.$store.commit('settings/setTheme', element.value);
        setTimeout(() => {
          document.body.classList.remove('transition-all');
        }, 300);
      }, 300);
    }
  }
});
</script>

<style lang="scss"></style>
