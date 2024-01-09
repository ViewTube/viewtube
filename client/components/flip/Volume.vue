<script setup lang="ts">
const videoState = inject<VideoState>('videoState');
const uiState = inject<UIState>('uiState');

const onVolumeSeekStart = () => {
  uiState.setSeeking(true);
};
const onVolumeSeekStop = () => {
  uiState.setSeeking(false);
};
</script>

<template>
  <div class="flip-volume-control">
    <RangeInput
      :model-value="videoState.video.volume"
      class="volume-input"
      @update:model-value="videoState.setVolume"
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
  left: 44px + 10px;

  :deep(.volume-input) {
    width: 120px;
  }
}
</style>
