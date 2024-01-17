<script setup lang="ts">
const uiState = inject<UIState>('uiState');
const videoState = inject<VideoState>('videoState');
</script>

<template>
  <div class="flip-settings-container clickaway-div" @click="uiState.closeSettings">
    <div class="flip-settings" @click.stop>
      <div class="flip-setting mobile-only">
        <VTIcon class="flip-setting-icon" name="mdi:volume" />
        <FlipVolume mobile />
      </div>
      <div class="flip-setting">
        <VTIcon class="flip-setting-icon" name="mdi:high-definition-box" />
        <p>Video Quality</p>
        <div class="quality-list">
          <div
            v-for="(quality, index) in videoState.video.videoQualityList"
            :key="index"
            :class="{ selected: index === videoState.video.videoQualityIndex }"
            class="quality"
          >
            {{ quality.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.flip-settings-container {
  z-index: 500;
  display: flex;
  opacity: 1;
  pointer-events: all;

  .flip-settings {
    margin: auto;
    background-color: var(--bgcolor-alt);
    border-radius: 5px;
    width: 100%;
    max-width: 400px;
    display: flex;
    box-shadow: $medium-shadow;
    flex-direction: column;

    .flip-setting {
      padding: 10px 15px 10px 40px;
      display: flex;
      flex-direction: column;
      position: relative;

      .quality-list {
        display: flex;
        flex-direction: column;

        .quality {
          &.selected {
            color: var(--theme-color);
          }
        }
      }

      &.mobile-only {
        @media screen and (min-width: $mobile-width) {
          display: none;
        }
      }

      .flip-setting-icon {
        position: absolute;
        left: 10px;
        top: 10px;
        width: 20px;
        height: 20px;
        color: var(--theme-color);
      }
    }
  }
}
</style>
