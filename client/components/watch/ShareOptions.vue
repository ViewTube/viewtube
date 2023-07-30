<template>
  <div class="share-options">
    <div class="share-options-container">
      <ShareOptionEntry class="share-option" option-name="Copy Link" :click="shareCopyLink">
        <VTIcon name="mdi:content-copy" class="copy-icon" />
      </ShareOptionEntry>
      <ShareOptionEntry class="share-option" option-name="Open QR-Code" :click="qrOpen">
        <VTIcon name="mdi:qrcode" class="qrcode-icon" />
      </ShareOptionEntry>
      <ShareOptionEntry
        class="share-option"
        option-name="Save to pocket"
        :click="saveToPocket"
        style="color: #ef4056"
      >
        <img src="@/assets/icons/pocket.svg" alt="Save to pocket icon" />
      </ShareOptionEntry>
    </div>
    <Teleport to="body">
      <transition name="fade-down">
        <QrPopUp v-if="qrPopUpOpen" @close="qrClose" />
      </transition>
    </Teleport>
  </div>
</template>

<script lang="ts">
import QrPopUp from '@/components/popup/QrPopUp.vue';
import ShareOptionEntry from '@/components/list/ShareOptionEntry.vue';

export default defineComponent({
  name: 'ShareOptions',
  components: {
    ShareOptionEntry,
    QrPopUp
  },
  setup() {
    const qrPopUpOpen = ref(false);

    const url = (): string => {
      return window?.location.href ?? '';
    };
    // shareReddit() {},
    const shareCopyLink = () => {
      navigator.clipboard.writeText(url());
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
      if (process.client) {
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
