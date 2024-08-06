<script setup lang="ts">
import { clamp } from '@vueuse/core';

const props = defineProps<{
  mobile?: boolean;
  videoState: VideoState;
  uiState: UiState;
}>();

const onVolumeSeekStart = () => {
  props.uiState.setSeeking(true);
};
const onVolumeSeekStop = () => {
  props.uiState.setSeeking(false);
};

const setVolume = (volume: number) => {
  volume = clamp(volume, 0, 1);
  props.videoState.setMuted(volume === 0);
  props.videoState.setVolume(volume);
};
</script>

<template>
  <div class="flip-volume-control" :class="{ mobile }">
    <RangeInput
      :model-value="videoState.video.volume"
      class="volume-input"
      @update:model-value="setVolume"
      @seek-start="onVolumeSeekStart"
      @seek-end="onVolumeSeekStop"
    />
  </div>
</template>

<style lang="scss" scoped>
.flip-volume-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 44px + 5px;

  &.mobile {
    position: static;
    transform: none;
    width: 100%;
    :deep(.volume-input) {
      width: 100%;
    }
  }

  :deep(.volume-input) {
    width: 120px;
  }
}
</style>
