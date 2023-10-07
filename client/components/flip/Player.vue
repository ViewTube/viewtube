<script setup lang="ts">
import { ApiDto } from '@/utils/shared';

const props = defineProps<{
  video: ApiDto<'VTVideoInfoDto'>;
  startTime?: number;
}>();
const videoElementRef = ref<HTMLVideoElement | null>(null);
const videoObj = toRef(props, 'video');
const startTime = toRef(props, 'startTime');

const { proxyUrl } = useImgProxy();
const { videoSource, adapterType } = useVideoSource(videoObj);

const { videoState } = useVideoState(videoElementRef, adapterType, videoSource, startTime);
</script>

<template>
  <div class="flip-player">
    <FlipPlayerUI :video-state="videoState" :video="video">
      <video
        ref="videoElementRef"
        class="flip-video-element"
        :poster="proxyUrl(videoObj.thumbnails[0].url)"
      />
    </FlipPlayerUI>
  </div>
</template>

<style lang="scss" scoped>
.flip-player {
}
</style>
