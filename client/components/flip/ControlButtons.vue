<script setup lang="ts">
import { getTimestampFromSeconds } from '@/utils/shared';

const videoState = inject<VideoState>('videoState');
const uiState = inject<UIState>('uiState');

const onPlayPauseClick = () => {
  if (videoState.video.playing) {
    videoState.pause();
  } else {
    videoState.play();
  }
};

const volumeControlVisible = ref(false);
const onVolumeClick = () => {
  volumeControlVisible.value = !volumeControlVisible.value;
};

const timestampText = computed(() => getTimestampFromSeconds(videoState.video.currentTime));
const videoLengthText = computed(() => getTimestampFromSeconds(videoState.video.duration));
</script>

<template>
  <div class="flip-control-buttons">
    <span class="timestamp-text left">{{ timestampText }}</span>
    <button class="control-button volume-control" @click.stop="onVolumeClick">
      <VTIcon name="mdi:volume" />
      <FlipVolume />
    </button>
    <div class="control-buttons center-buttons">
      <button class="control-button">
        <VTIcon name="mdi:skip-previous" />
      </button>
      <button class="control-button play-button" @click.stop="onPlayPauseClick">
        <VTIcon v-if="!videoState.video.playing" name="mdi:play" />
        <VTIcon v-else name="mdi:pause" />
      </button>
      <button class="control-button">
        <VTIcon name="mdi:skip-next" />
      </button>
    </div>
    <div class="control-buttons">
      <button class="control-button">
        <VTIcon name="mdi:cog" />
      </button>
      <button class="control-button" @click.stop="uiState.toggleFullscreen">
        <VTIcon v-if="uiState.fullscreen" name="mdi:arrow-collapse" />
        <VTIcon v-else name="mdi:arrow-expand" />
      </button>
    </div>
    <span class="timestamp-text right">{{ videoLengthText }}</span>
  </div>
</template>

<style lang="scss" scoped>
.flip-control-buttons {
  display: flex;
  justify-content: space-between;
  height: 60px;
  padding: 10px 10px 0 10px;
  pointer-events: auto;
  color: #fefefe;
  position: relative;

  .timestamp-text {
    position: absolute;
    left: 0;
    top: -5px;
    margin: 0 15px;
    font-size: 0.8rem;

    &.right {
      left: auto;
      right: 0;
    }
  }

  .control-buttons {
    display: flex;

    &.center-buttons {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .volume-control {
    @media screen and (max-width: $mobile-width) {
      visibility: hidden !important;
    }
  }

  .control-button {
    all: unset;
    cursor: pointer;
    padding: 0 10px;
    position: relative;
    display: flex;
    align-items: center;

    &::after {
      display: none;
    }

    &.play-button {
      :deep(.vt-icon) {
        width: 3em;
        height: 3em;
      }
    }
  }
}
</style>
