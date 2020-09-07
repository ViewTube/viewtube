<template>
  <div class="share-options">
    <div class="share-options-container">
      <ShareOptionEntry
        class="share-option"
        optionName="Copy Link"
        :click="shareCopyLink"
      >
        <Copy class="copy-icon" />
      </ShareOptionEntry>
      <ShareOptionEntry
        class="share-option"
        optionName="Open QR-Code"
        :click="qrOpen"
      >
        <QrCode class="qrcode-icon" />
      </ShareOptionEntry>
    </div>
    <portal to="popup">
      <transition name="fade-down">
        <QrPopUp v-if="qrPopUpOpen" @close="qrClose" />
      </transition>
    </portal>
  </div>
</template>

<script>
import ShareOptionEntry from '@/components/list/ShareOptionEntry';
import Copy from 'vue-material-design-icons/ContentCopy';
import QrCode from 'vue-material-design-icons/Qrcode';
import QrPopUp from '@/components/popup/QrPopUp';

export default {
  name: 'ShareOptions',
  components: {
    ShareOptionEntry,
    Copy,
    QrCode,
    QrPopUp
  },
  data() {
    return { qrPopUpOpen: false };
  },
  methods: {
    url() {
      return process.browser ? window.location.href : '';
    },
    // shareReddit() {},
    shareCopyLink() {
      if (process.browser) {
        navigator.clipboard.writeText(this.url());
      }
    },
    shareCreateQR() {},

    qrOpen() {
      this.qrPopUpOpen = true;
    },
    qrClose() {
      this.qrPopUpOpen = false;
    }
  }
};
</script>

<style lang="scss">
.share-options {
  .share-options-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;

    .share-option {
      height: 46px;
      width: 46px;
      margin: 4px 4px 4px 0;

      .material-design-icon__svg {
        margin: 4px;
        height: 38px !important;
        width: 38px !important;
        position: unset !important;
      }
    }
  }
}
</style>
