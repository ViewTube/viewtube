<template>
  <div class="popup">
    <div class="popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>QR-Code</h1>
      <div class="qr-container">
        <VueQrcode
          class="qr-code"
          :value="url()"
          :options="{
            color: {
              dark: getThemePrimaryColor(),
              light: getThemeBackgroundColor()
            },
            width: 500
          }"
        />
      </div>
    </div>
    <div class="settings-overlay popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script lang="ts">
import VueQrcode from '@chenfengyuan/vue-qrcode';
import CloseIcon from 'vue-material-design-icons/Close.vue';
import '@/assets/styles/popup.scss';
import { defineComponent } from '@nuxtjs/composition-api';
import { useAccessor } from '~/store';

export default defineComponent({
  name: 'QrPopUp',
  components: {
    VueQrcode,
    CloseIcon
  },
  setup() {
    const accessor = useAccessor();

    const url = (): string => {
      return process.browser ? window.location.href : '';
    };
    const getThemePrimaryColor = (): string => {
      return accessor.settings.themeVariables['theme-color'];
    };
    const getThemeBackgroundColor = (): string => {
      return accessor.settings.themeVariables['bgcolor-alt'];
    };

    return {
      url,
      getThemePrimaryColor,
      getThemeBackgroundColor
    };
  }
});
</script>

<style lang="scss" scoped>
.qr-container {
  display: flex;
  width: 100%;
  margin: 0 !important;

  .qr-code {
    margin: auto;

    @media screen and (max-width: $mobile-width) {
      max-width: 90vw;
      max-height: 90vw;
    }
  }
}
</style>
