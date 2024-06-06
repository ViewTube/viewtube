<script setup lang="ts">
import type { ApiDto } from '@viewtube/shared';

const props = defineProps<{
  video: ApiDto<'VTVideoInfoDto'>;
  startTime?: number;
  autoplay?: boolean;
  embed?: boolean;
}>();

const emit = defineEmits<{
  (e: 'videoEnded');
}>();

const videoElementRef = ref<HTMLVideoElement | null>(null);
const videoObj = toRef(props, 'video');
const startTime = toRef(props, 'startTime');

const { source, type } = useVideoSource(videoObj);

const videoState = useVideoState({
  videoElementRef,
  source,
  video: props.video,
  sourceType: type,
  videoEnded: () => emit('videoEnded'),
  startTime,
  autoplay: props.autoplay,
  embed: props.embed
});
</script>

<template>
  <div class="flip-player" :class="{ embed }">
    <FlipPlayerUI :video-state :video :embed>
      <video ref="videoElementRef" class="flip-video-element" />
    </FlipPlayerUI>
  </div>
</template>

<style lang="scss" scoped>
.flip-player {
  touch-action: none;

  &.embed {
    height: 100%;

    .flip-video-element {
      height: 100%;
    }
  }
}
</style>
