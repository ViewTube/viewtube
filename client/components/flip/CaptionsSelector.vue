<script setup lang="ts">
import { useMessagesStore } from '@/store/messages';
import X2js from 'x2js';

const { textProxy } = useProxyUrls();
const { vtFetch } = useVtFetch();
const messagesStore = useMessagesStore();
const video = inject<ApiDto<'VTVideoInfoDto'>>('video');
const videoState = inject<VideoState>('videoState');

type Caption = {
  text: string;
  start: number;
  duration: number;
};
const captionTrack = ref<Caption[]>([]);

watch(
  () => videoState.video.selectedCaption,
  async newValue => {
    if (newValue) {
      try {
        const captionUrl = `${textProxy}${encodeURIComponent(newValue.url)}`;
        const captionXml = await vtFetch<string>(captionUrl);
        console.log(captionXml);

        const x2js = new X2js();

        const captionsObject = x2js.xml2js(captionXml);
        console.log(captionsObject);
      } catch (error: any) {
        messagesStore.createMessage({
          type: 'error',
          title: 'Error loading captions',
          message: error.message
        });
      }
    }
  }
);
</script>

<template>
    <div class="flip-setting">
    <VTIcon class="flip-setting-icon" name="mdi:closed-caption" />
    <ListCollapsibleSection label="Subtitles/Closed Captions" opened>
      <div class="selector-list">
        <div
          v-for="(track, index) in video.captions"
          :key="index"
          :class="{ selected: false }"
          class="selector"
          @click.stop="videoState.setTrack(track.id)"
        >
          {{ track.audioLabel }}
        </div>
      </div>
    </ListCollapsibleSection>
  </div>
</template>

<style lang="scss" scoped></style>
