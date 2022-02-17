<template>
  <div class="share-options">
    <div class="share-options-container">
      <ShareOptionEntry class="share-option" optionName="Copy Link" :click="shareCopyLink">
        <Copy class="copy-icon" />
      </ShareOptionEntry>
      <ShareOptionEntry class="share-option" optionName="Open QR-Code" :click="qrOpen">
        <QrCode class="qrcode-icon" />
      </ShareOptionEntry>
      <ShareOptionEntry
        class="share-option"
        optionName="Save to pocket"
        :click="saveToPocket"
        style="color: #ef4056"
      >
        <img src="@/assets/icons/pocket.svg" alt="Save to pocket icon" />
      </ShareOptionEntry>
    </div>
    <portal to="popup">
      <transition name="fade-down">
        <QrPopUp v-if="qrPopUpOpen" @close="qrClose" />
      </transition>
    </portal>
  </div>
</template>

<script lang="ts">
import Copy from 'vue-material-design-icons/ContentCopy.vue';
import QrCode from 'vue-material-design-icons/Qrcode.vue';
import { defineComponent, ref } from '#imports';
import QrPopUp from '@/components/popup/QrPopUp.vue';
import ShareOptionEntry from '@/components/list/ShareOptionEntry.vue';

export default defineComponent({
  name: 'ShareOptions',
  components: {
    ShareOptionEntry,
    Copy,
    QrCode,
    QrPopUp
  },
  setup() {
    const qrPopUpOpen = ref(false);

    const url = (): string => {
      return process.browser ? window.location.href : '';
    };
    // shareReddit() {},
    const shareCopyLink = () => {
      if (process.browser) {
        navigator.clipboard.writeText(url());
      }
    };
    const saveToPocket = () => {
      window.open(`https://getpocket.com/save?url=${encodedUrl}`, '_blank');
    };
    const qrOpen = () => {
      qrPopUpOpen.value = true;
    };
    const qrClose = () => {
      qrPopUpOpen.value = false;
    };

    const encodedUrl = () => {
      if (process.browser) {
        return encodeURIComponent(window.location.href);
      } else {
        return '';
      }
    };

    return {
      qrPopUpOpen,
      url,
      shareCopyLink,
      qrOpen,
      encodedUrl,
      qrClose,
      saveToPocket
    };
  }
});
</script>

<style lang="scss">
.share-options {
  height: 60px;
  .share-options-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}
</style>
