<template>
  <div class="popup">
    <div class="popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>Theme Editor</h1>
      <form v-if="theme" @submit.prevent="submitTheme">
        <FormInput :id="'themename'" v-model="theme.name" :label="'Name of theme'" :type="'text'" />
        <ColorPicker
          :label="'bgcolor-main'"
          :initialColor="theme.themeVariables['bgcolor-main']"
          :colorPickerPosBottom="true"
          @input="theme.themeVariables['bgcolor-main'] = $event"
        />
        <ColorPicker
          :label="'bgcolor-alt'"
          :initialColor="theme.themeVariables['bgcolor-alt']"
          :colorPickerPosBottom="true"
          @input="theme.themeVariables['bgcolor-alt'] = $event"
        />
        <ColorPicker
          :label="'bgcolor-alt-light'"
          :initialColor="theme.themeVariables['bgcolor-alt-light']"
          :colorPickerPosBottom="true"
          @input="theme.themeVariables['bgcolor-alt-light'] = $event"
        />
        <ColorPicker
          :label="'bgcolor-translucent'"
          :initialColor="theme.themeVariables['bgcolor-translucent']"
          :colorPickerPosBottom="true"
          @input="theme.themeVariables['bgcolor-translucent'] = $event"
        />
        <ColorPicker
          :label="'error-color-green'"
          :initialColor="theme.themeVariables['error-color-green']"
          @input="theme.themeVariables['error-color-green'] = $event"
        />
        <ColorPicker
          :label="'error-color-red'"
          :initialColor="theme.themeVariables['error-color-red']"
          @input="theme.themeVariables['error-color-red'] = $event"
        />
        <ColorPicker
          :label="'theme-color'"
          :initialColor="theme.themeVariables['theme-color']"
          @input="theme.themeVariables['theme-color'] = $event"
        />
        <ColorPicker
          :label="'theme-color-light'"
          :initialColor="theme.themeVariables['theme-color-light']"
          @input="theme.themeVariables['theme-color-light'] = $event"
        />
        <ColorPicker
          :label="'theme-color-dark'"
          :initialColor="theme.themeVariables['theme-color-dark']"
          @input="theme.themeVariables['theme-color-dark'] = $event"
        />
        <ColorPicker
          :label="'theme-color-alt'"
          :initialColor="theme.themeVariables['theme-color-alt']"
          @input="theme.themeVariables['theme-color-alt'] = $event"
        />
        <ColorPicker
          :label="'theme-color-translucent'"
          :initialColor="theme.themeVariables['theme-color-translucent']"
          @input="theme.themeVariables['theme-color-translucent'] = $event"
        />
        <!-- TODO theme-color-gradient input -->
        <ColorPicker
          :label="'shadow-load-color'"
          :initialColor="theme.themeVariables['shadow-load-color']"
          @input="theme.themeVariables['shadow-load-color'] = $event"
        />
        <ColorPicker
          :label="'header-bgcolor'"
          :initialColor="theme.themeVariables['header-bgcolor']"
          @input="theme.themeVariables['header-bgcolor'] = $event"
        />
        <ColorPicker
          :label="'header-transparent'"
          :initialColor="theme.themeVariables['header-transparent']"
          @input="theme.themeVariables['header-transparent'] = $event"
        />
        <ColorPicker
          :label="'title-color'"
          :initialColor="theme.themeVariables['title-color']"
          @input="theme.themeVariables['title-color'] = $event"
        />
        <ColorPicker
          :label="'subtitle-color'"
          :initialColor="theme.themeVariables['subtitle-color']"
          @input="theme.themeVariables['subtitle-color'] = $event"
        />
        <ColorPicker
          :label="'subtitle-color-light'"
          :initialColor="theme.themeVariables['subtitle-color-light']"
          @input="theme.themeVariables['subtitle-color-light'] = $event"
        />
        <SubmitButton v-if="theme" class="submit" :label="'Save Theme'" />
        <SubmitButton v-if="!theme" class="submit" :label="'Create Theme'" />
      </form>
      <div class="preview">
        <ThemePreview :theme="theme" />
      </div>
    </div>
    <div class="popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script lang="ts">
import CloseIcon from 'vue-material-design-icons/Close.vue';
import SubmitButton from '@/components/form/SubmitButton.vue';
import FormInput from '@/components/form/FormInput.vue';
import ColorPicker from '@/components/form/ColorPicker.vue';
import ThemePreview from '@/components/themes/ThemePreview.vue';
import '@/assets/styles/popup.scss';
import Vue from 'vue';
import { ThemeDto } from '@/plugins/shared';
export default Vue.extend({
  name: 'ThemeEditor',
  components: { CloseIcon, SubmitButton, FormInput, ColorPicker, ThemePreview },
  props: {
    themeProp: Object
  },
  data() {
    return {
      theme: {
        value: '',
        name: '',
        themeVariables: {
          'bgcolor-main': '#121212',
          'bgcolor-alt': '#1a1a1a',
          'bgcolor-alt-light': '#484848',
          'bgcolor-translucent': '#0000007c',
          'error-color-green': '#4caf50',
          'error-color-red': '#d93025',
          'theme-color': '#06b300',
          'theme-color-light': '#60c25c',
          'theme-color-dark': '#1da019',
          'theme-color-alt': '#108dc7',
          'theme-color-translucent': '#06b30080',
          'line-color': 'rgba(255, 255, 255, 0.2)',
          'line-accent-color': 'rgba(255, 255, 255, 0.4)',
          'theme-color-gradient': `linear-gradient(
              53deg,
              rgba(6, 179, 0, 1) 0%,
              rgb(104, 207, 101) 33%,
              rgba(89, 193, 186, 1) 78%,
              rgba(0, 212, 255, 1) 100%
            )`,
          'shadow-load-color': '#535353b6',
          'header-bgcolor': '#272727',
          'header-transparent': '#00000000',
          'title-color': '#ebebeb',
          'subtitle-color': '#d8d8d8',
          'subtitle-color-light': '#b3b3b3',
          darkness: 'invert(100%)',
          'gradient-opacity': 0
        }
      } as ThemeDto,
      colors: ''
    };
  },
  mounted() {
    if (this.editMode) {
      this.theme = this.themeProp;
    }
  },
  methods: {
    submitTheme() {}
  }
});
</script>

<style lang="scss" scoped>
.popup {
  height: 100%;
}
.popup-container {
  max-width: 900px;
}
form > * {
  margin-top: 10px;
}
.preview {
  position: absolute;
  right: 10px;
  top: 50px;
}
</style>
