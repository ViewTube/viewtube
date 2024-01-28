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
        <div class="selector-list">
          <pre>{{ JSON.stringify(videoState.video.trackList, null, 2) }}</pre>
          <div
            v-for="(track, index) in videoState.video.trackList"
            :key="index"
            :class="{ selected: track.id === videoState.video.trackIndex }"
            class="selector"
          >
            {{ track.label }}
          </div>
        </div>
      </div>
      <div class="flip-setting">
        <VTIcon class="flip-setting-icon" name="mdi:globe" />
        <p>Language</p>
        <div class="selector-list">
          <div
            v-for="(language, index) in videoState.video.languageList"
            :key="index"
            :class="{ selected: language.language === videoState.video.selectedLanguage }"
            class="selector"
            @click.stop="videoState.setLanguage(language.language)"
          >
            {{ language.label }}
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
    margin: $header-height auto;
    background-color: var(--bgcolor-alt);
    border-radius: 5px;
    width: 100%;
    max-width: 400px;
    height: auto;
    max-height: 100%;
    display: flex;
    box-shadow: $medium-shadow;
    flex-direction: column;
    overflow: auto;

    .flip-setting {
      padding: 10px 15px 10px 40px;
      display: flex;
      flex-direction: column;
      position: relative;

      .selector-list {
        display: flex;
        flex-direction: column;
        padding: 10px 0 0 0;
        gap: 2px;

        .selector {
          padding: 5px 10px;
          border-radius: 5px;
          font-size: 0.9rem;
          box-sizing: border-box;
          cursor: pointer;

          &:hover {
            background-color: var(--bgcolor-alt-light);
          }

          &.selected {
            background-color: var(--theme-color-translucent);
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
