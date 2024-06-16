<script setup lang="ts">
defineProps<{
  videoState: VideoState;
}>();
</script>

<template>
  <div class="flip-loading">
    <Spinner class="flip-spinner" />
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
}
</style>
