<script setup lang="ts">
defineProps<{
  videoState: VideoState;
}>();
</script>

<template>
  <div class="flip-loading">
    <Spinner class="flip-spinner" />
    <h2 class="flip-loading-text">{{ videoState.bufferMessage.value }}...</h2>
  </div>
</template>

<style lang="scss" scoped>
.flip-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;

  .flip-loading-text {
    color: #fff;
    // font-size: 1.5rem;
    text-shadow: $low-shadow;
  }
}
</style>
