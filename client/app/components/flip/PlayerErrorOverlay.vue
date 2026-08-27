<script setup lang="ts">
import type { PlayerError } from '~/utils/videoplayer/types';

defineProps<{
  error: PlayerError;
}>();

const reload = () => window.location.reload();
</script>

<template>
  <div class="flip-player-error-overlay">
    <VTIcon name="mdi:alert-circle-outline" class="error-icon" />
    <p class="error-title">Video playback failed</p>
    <p class="error-message">{{ error.message }}</p>
    <button class="error-retry" @click.stop="reload">Try again</button>
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
  gap: 8px;
  padding: 20px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.8);
  color: var(--title-color);
  z-index: 20;
  pointer-events: auto;

  .error-icon {
    font-size: 3rem;
    color: var(--error-color-red);
  }

  .error-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .error-message {
    margin: 0;
    max-width: 46ch;
    font-size: 0.9rem;
    color: var(--subtitle-color-light, var(--title-color));
    opacity: 0.85;
  }

  .error-retry {
    margin-top: 8px;
    padding: 8px 18px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--title-color);
    background-color: var(--bgcolor-alt-light);

    &:hover {
      background-color: var(--theme-color);
    }
  }
}
</style>
