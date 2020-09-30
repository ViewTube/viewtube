<template>
  <div class="popup">
    <div class="popup-container">
      <div class="themeCloner">
        <CloseIcon class="close-icon" @click.stop="$emit('close')" />
        <h1>Clone Theme</h1>
        <Dropdown
          placeholder="Choose a Parent Theme"
          :options="themes"
          label="name"
          @input="keyChange"
        />
      </div>
    </div>
    <div class="popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script>
import CloseIcon from 'vue-material-design-icons/Close';
import Dropdown from '@/components/form/Dropdown';
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
    selectedTheme: String,
    newThemeName: String
  }),
  mounted() {
    this.selectedTheme = '';
    this.newThemeName = '';
  },
  methods: {
    keyChange(element) {
      this.selectedTheme = element.key;
    }
  }
};
</script>

<style lang="scss">
.themeCloner {
  margin: 15px 20px;
  width: calc(100% -40px);
}
</style>
