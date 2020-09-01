<template>
  <div class="share-options">
    <div class="share-options-container">
      <ShareOptionEntry optionName="Reddit">
        <Reddit class="reddit-icon" />
      </ShareOptionEntry>
      <ShareOptionEntry optionName="Copy Link" :click="shareCopyLink">
        <Copy class="copy-icon" />
      </ShareOptionEntry>
      <ShareOptionEntry optionName="Open QR-Code" :click="qrOpen">
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
import ShareOptionEntry from '@/components/list/ShareOptionEntry'
import Reddit from 'vue-material-design-icons/Reddit'
import Copy from 'vue-material-design-icons/ContentCopy'
import QrCode from 'vue-material-design-icons/Qrcode'
import QrPopUp from '@/components/popup/QrPopUp'

export default {
  name: 'ShareOptions',
  components: {
    ShareOptionEntry,
    Reddit,
    Copy,
    QrCode,
    QrPopUp
  },
  data() {
    return { qrPopUpOpen: false }
  },
  props: {
    shareOptions: Array
  },
  methods: {
    url() {
      return process.browser ? window.location.href : ''
    },
    // shareReddit() {},
    shareCopyLink() {
      if (process.browser) {
        navigator.clipboard.writeText(this.url())
      }
    },
    shareCreateQR() {},

    qrOpen() {
      this.qrPopUpOpen = true
    },
    qrClose() {
      this.qrPopUpOpen = false
    }
  }
}
</script>

<style lang="scss">
.share-options {
  .share-options-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
  }
}
</style>
