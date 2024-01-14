<script setup lang="ts">
defineProps<{
  mobile?: boolean;
}>();
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
  <div class="flip-volume-control" :class="{ mobile }">
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
