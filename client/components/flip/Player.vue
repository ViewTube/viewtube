<script setup lang="ts">
import { ApiDto } from '@/utils/shared';

const props = defineProps<{
  video: ApiDto<'VTVideoInfoDto'>;
  startTime?: number;
}>();
const videoElementRef = ref<HTMLVideoElement | null>(null);
const videoObj = toRef(props, 'video');
const startTime = toRef(props, 'startTime');

const { videoSource, adapterType } = useVideoSource(videoObj);

const videoState = useVideoState(videoElementRef, adapterType, videoSource, startTime);
provide('videoState', readonly(videoState));
provide('video', readonly(props.video));
</script>

<template>
  <div class="flip-player">
    <FlipPlayerUI>
      <video ref="videoElementRef" class="flip-video-element" />
    </FlipPlayerUI>
  </div>
</template>

<style lang="scss" scoped>
.flip-player {
  touch-action: none;
}
</style>
