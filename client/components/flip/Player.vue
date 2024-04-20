<script setup lang="ts">
const props = defineProps<{
  video: ApiDto<'VTVideoInfoDto'>;
  startTime?: number;
}>();
const videoElementRef = ref<HTMLVideoElement | null>(null);
const videoObj = toRef(props, 'video');
const startTime = toRef(props, 'startTime');

const { videoSource } = useVideoSource(videoObj);

const videoState = useVideoState(videoElementRef, videoSource, startTime);
</script>

<template>
  <div class="flip-player">
    <FlipPlayerUI :video-state="videoState" :video="video">
      <video ref="videoElementRef" class="flip-video-element" />
    </FlipPlayerUI>
  </div>
</template>

<style lang="scss" scoped>
.flip-player {
  touch-action: none;
}
</style>
