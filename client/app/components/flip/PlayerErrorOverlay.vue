<script setup lang="ts">
import type { PlayerError } from '~/utils/videoplayer/types';

defineProps<{
  error: PlayerError;
}>();
</script>

<template>
  <div class="flip-player-error-overlay">
    <VTIcon name="mdi:alert-circle-outline" class="error-icon" />
    <p class="error-message">{{ error.message }}</p>
  </div>
</template>

<style lang="scss" scoped>
.flip-player-error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.75);
  color: var(--title-color);
  z-index: 20;
  pointer-events: auto;

  .error-icon {
    font-size: 3rem;
    color: var(--error-color-red);
  }

  .error-message {
    margin: 0;
    max-width: 40ch;
    font-size: 1rem;
  }
}
</style>
