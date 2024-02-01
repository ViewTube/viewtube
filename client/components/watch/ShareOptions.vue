<template>
  <div class="share-options">
    <div class="share-options-container">
      <ShareOptionEntry class="share-option" option-name="Copy ViewTube Link" :click="shareCopyViewTubeLink">
        <VTIcon name="mdi:content-copy" class="copy-icon" />
      </ShareOptionEntry>
      <ShareOptionEntry class="share-option" option-name="Copy YouTube Link" :click="shareCopyYouTubeLink">
        <VTIcon name="mdi:youtube" class="copy-icon" />
      </ShareOptionEntry>
      <ShareOptionEntry class="share-option" option-name="Copy ViewTube Link at Current Timestamp"
                        :click="shareCopyLinkAtCurrentTimestamp">
        <VTIcon name="mdi:clipboard-text-time-outline" class="copy-icon" />
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
import { useVideoPlayerStore } from '@/store/videoPlayer';
import { useMessagesStore } from '@/store/messages';

export default defineComponent({
  name: 'ShareOptions',
  components: {
    ShareOptionEntry,
    QrPopUp
  },
  props: {
    videoId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const messagesStore = useMessagesStore();
    const qrPopUpOpen = ref(false);
    const videoPlayerStore = useVideoPlayerStore();

    const url = (): string => {
      return window?.location.href ?? '';
    };
    // shareReddit() {},
    const shareCopyViewTubeLink = () => {
      writeToClipboard(url());
    };
    const shareCopyYouTubeLink = () => {
      const url = `https://youtu.be/${props.videoId}`;
      writeToClipboard(url);
    };
    const writeToClipboard = (text: string) => {
      if (!navigator.clipboard) {
        messagesStore.createMessage({
          title: 'Unable to copy',
          message: 'Running ViewTube on non-https website.',
          type: 'error',
          dismissDelay: 3000
        });
        return;
      }
      navigator.clipboard.writeText(text);
    };
    const shareCopyLinkAtCurrentTimestamp = () => {
      const currentHref = new URL(url());
      currentHref.searchParams.set('t', Math.round(videoPlayerStore.currentTime).toString());
      writeToClipboard(currentHref.href);
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
      shareCopyViewTubeLink,
      shareCopyYouTubeLink,
      shareCopyLinkAtCurrentTimestamp,
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
