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

import Vue from 'vue';

export default Vue.extend({
  name: 'QrPopUp',
  components: {
    VueQrcode,
    CloseIcon
  },
  methods: {
    url(): string {
      return process.browser ? window.location.href : '';
    },
    getThemePrimaryColor(): string {
      return this.$store.getters['theme/themeVariables']['theme-color'];
    },
    getThemeBackgroundColor(): string {
      return this.$store.getters['theme/themeVariables']['bgcolor-alt'];
    }
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
