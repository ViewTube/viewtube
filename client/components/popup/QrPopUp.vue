<template>
  <div class="popup">
    <div class="popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>QR-Code</h1>
      <div class="qr-container"><canvas id="qrcode" ref="qrCodeRef" /></div>
    </div>
    <div class="settings-overlay popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script lang="ts">
import QRCode from 'qrcode/build/qrcode';
import CloseIcon from 'vue-material-design-icons/Close.vue';
import '@/assets/styles/popup.scss';
import { defineComponent, onMounted, ref } from '@nuxtjs/composition-api';
import { useAccessor } from '@/store';

export default defineComponent({
  name: 'QrPopUp',
  components: {
    CloseIcon
  },
  setup() {
    const accessor = useAccessor();

    const qrCodeRef = ref(null);

    const url = (): string => {
      return process.browser ? window.location.href : '';
    };
    const getThemePrimaryColor = (): string => {
      return accessor.settings.themeVariables['theme-color'];
    };
    const getThemeBackgroundColor = (): string => {
      return accessor.settings.themeVariables['bgcolor-alt'];
    };

    onMounted(() => {
      console.log(qrCodeRef.value);
      const computedStyle = getComputedStyle(document.documentElement);
      const themeColor = computedStyle.getPropertyValue('--theme-color').trim();
      const bgColor = computedStyle.getPropertyValue('--bgcolor-alt').trim();
      QRCode.toCanvas(
        qrCodeRef.value,
        url(),
        { errorCorrectionLevel: 'H', width: 360, color: { dark: themeColor, light: bgColor } },
        () => {}
      );
    });

    return {
      url,
      getThemePrimaryColor,
      getThemeBackgroundColor,
      qrCodeRef
    };
  }
});
</script>

<style lang="scss" scoped>
.qr-container {
  display: flex;
  width: 100%;
  height: 100%;
  margin: 0 !important;
  padding-bottom: 0 !important;

  #qrcode {
    margin: auto;
    @media screen and (max-width: $mobile-width) {
      width: 240px !important;
      height: 240px !important;
    }
  }
}
</style>
