<template>
  <div class="settings popup">
    <div class="settings-container popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>Settings</h1>
      <h2><ThemeIcon />Theme</h2>
      <ThemeSelector />
      <h2><ChaptersIcon />Chapters</h2>
      <SwitchButton
        :value="$store.getters['settings/chapters']"
        :label="'Show chapters on a video'"
        :disabled="false"
        :btnId="'settings-btn-1'"
        @valuechange="val => $store.commit('settings/setChapters', val)"
      />
      <h2>
        <img
          class="sponsorblock-image"
          src="@/assets/icons/sponsorblock.png"
          alt="Sponsorblock icon"
        />Block ads and annoyances
      </h2>
      <span class="small-label links"
        >Using
        <a href="https://sponsor.ajay.app/" target="_blank" rel="noreferrer noopener">
          https://sponsor.ajay.app/</a
        ></span
      >
      <SwitchButton
        :value="$store.getters['settings/sponsorblock']"
        :label="'Enable SponsorBlock'"
        :disabled="false"
        :btnId="'settings-btn-2'"
        @valuechange="val => $store.commit('settings/setSponsorblock', val)"
      />
      <h2><MiniplayerIcon />Miniplayer</h2>
      <SwitchButton
        :value="$store.getters['settings/miniplayer']"
        :label="'Enable miniplayer'"
        :disabled="false"
        :btnId="'settings-btn-3'"
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
import ChaptersIcon from 'vue-material-design-icons/BookOpenVariant.vue';
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
    ThemeSelector,
    ChaptersIcon
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

<style lang="scss">
h2 {
  .sponsorblock-image {
    height: 24px;
    width: 24px;
    margin: 0 10px 0 0;
    filter: grayscale(100%) brightness(0.9) invert(1);
  }
}
.small-label {
  margin: 0 0 0 36px;
  font-size: 0.8rem;
}
</style>
