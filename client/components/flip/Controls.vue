<script setup lang="ts"></script>

<template>
  <div class="controls">
    <FlipSeekbar />
    <FlipControlButtons />
  </div>
</template>

<style lang="scss" scoped>
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
    bottom: -1px;
    left: 0;
    z-index: -1;
    background-image: $video-player-gradient;
    transform: rotate(180deg);
  }
}
</style>
