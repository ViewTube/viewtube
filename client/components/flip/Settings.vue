<script setup lang="ts">
const uiState = inject<UIState>('uiState');
</script>

<template>
  <div class="flip-settings-container clickaway-div" @click="uiState.closeSettings">
    <div class="flip-settings">
      <div class="flip-setting mobile-only">
        <VTIcon class="flip-setting-icon" name="mdi:volume" />
        <FlipVolume mobile />
      </div>
      <div class="flip-setting">
        <VTIcon class="flip-setting-icon" name="mdi:cog" />
        <p>Other setting</p>
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
      flex-direction: row;
      position: relative;

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
