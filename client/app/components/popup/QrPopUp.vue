<template>
  <div class="popup">
    <div class="popup-container">
      <VTIcon v-ripple name="mdi:close" class="close-icon" @click.stop="$emit('close')" />
      <h1>QR-Code</h1>
      <div class="qr-container"><canvas id="qrcode" ref="qrCodeRef" /></div>
    </div>
    <div class="settings-overlay popup-overlay" @click.stop="$emit('close')" />
  </div>
</template>

<script setup lang="ts">
import * as QRCode from 'qrcode';
import '~/assets/styles/popup.scss';

defineEmits(['close']);

const { currentTheme } = useCurrentTheme();
const qrCodeRef = ref(null);

const url = (): string => {
  return window?.location.href ?? '';
};
const getThemePrimaryColor = (): string => {
  return currentTheme['theme-color'];
};
const getThemeBackgroundColor = (): string => {
  return currentTheme['bgcolor-alt'];
};

onMounted(() => {
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
    @media screen and (max-width: variables.$mobile-width) {
      width: 240px !important;
      height: 240px !important;
    }
  }
}
</style>
