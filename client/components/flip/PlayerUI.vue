<script setup lang="ts">
import { ApiDto } from '@/utils/shared';

defineProps<{
  video: ApiDto<'VTVideoInfoDto'>;
  videoState: VideoState;
}>();

const { uiState, onMouseMove, onMouseLeave, cursor } = useUiState();
</script>

<template>
  <div class="flip-player-ui" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
    <slot />
    <transition name="flip-fade">
      <div v-if="uiState.visible" class="controls">
        <FlipSeekbar
          :duration="videoState.duration"
          :buffer-level="videoState.bufferLevel"
          :current-time="videoState.currentTime"
        />
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.flip-fade-enter-active,
.flip-fade-leave-active {
  transition: opacity 300ms;
}
.flip-fade-enter-from,
.flip-fade-leave-to {
  opacity: 0;
}

.flip-player-ui {
  max-height: calc(100vh - 170px);
  height: 56.25vw;
  display: flex;
  background-color: #000;
  position: relative;
  cursor: v-bind(cursor);

  .controls {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    pointer-events: none;
    z-index: 10;

    &:after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100px;
      bottom: 0;
      left: 0;
      z-index: -1;
      background-image: $video-player-gradient;
      transform: rotate(180deg);
    }
  }

  :deep(.flip-video-element) {
    margin: 0 auto;
  }
}
</style>
