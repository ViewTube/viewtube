<template>
  <div class="popup">
    <div class="popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>Clone Theme</h1>
      <Dropdown
        :values="themes"
        :value="selectedTheme"
        :label="'Parent Theme'"
        :noDefault="false"
        class="themeDropdown"
        @valuechange="valueChange(entry)"
      />
    </div>
    <div class="popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script>
import CloseIcon from 'vue-material-design-icons/Close';
import Dropdown from '@/components/filter/Dropdown';
import '@/assets/styles/popup.scss';

export default {
  name: 'ThemeCloner',
  components: {
    CloseIcon,
    Dropdown
  },
  props: {
    themes: Array
  },
  data: () => ({
    selectedTheme: null
  }),
  methods: () => ({
    valueChange(entry) {
      this.selectedTheme = entry;
    }
  })
};
</script>

<style lang="scss">
.themeDropdown {
  min-width: 10vw;
}
</style>
