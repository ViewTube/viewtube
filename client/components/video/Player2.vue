<script setup lang="ts">
import { ApiDto } from '@/utils/shared';

const props = defineProps<{
  video: ApiDto<'VTVideoInfoDto'>;
  startTime?: number;
}>();
const videoRef = ref<HTMLVideoElement | null>(null);
const video = toRef(props, 'video');
const startTime = toRef(props, 'startTime');

const { proxyUrl } = useImgProxy();
const { videoSource, adapterType } = useVideoSource(video);

const { videoState } = useVideoState(videoRef, adapterType, videoSource, startTime);
</script>

<template>
  <div class="video-player-2">
    <video ref="videoRef" class="video-2" :poster="proxyUrl(video.thumbnails[0].url)" />
  </div>
  {{ videoState }}
</template>

<style lang="scss" scoped>
.video-player-2 {
  max-height: calc(100vh - 170px);
  height: 56.25vw;
  display: flex;
  background-color: #000;

  .video-2 {
    margin: 0 auto;
  }
}
</style>
