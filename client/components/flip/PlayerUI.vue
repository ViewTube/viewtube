<script setup lang="ts">
const videoState = inject<VideoState>('videoState');
const flipPlayerUIRef = ref<HTMLDivElement | null>(null);

const uiState = useUIState(videoState, flipPlayerUIRef);

const cursor = computed(() => uiState.cursor.value);
const visible = computed(() => uiState.visible.value);

provide('uiState', readonly(uiState));
</script>

<template>
  <div
    id="flip-player-ui"
    ref="flipPlayerUIRef"
    class="flip-player-ui"
    @pointerleave="uiState.onPointerLeave"
    @pointermove="uiState.onPointerMove"
    @pointerdown="uiState.onPointerDown"
    @pointerup="uiState.onPointerUp"
  >
    <slot />
    <Spinner v-if="videoState.video.buffering" class="flip-spinner" />
    <transition name="flip-fade">
      <FlipControls v-if="visible" />
    </transition>
    <FlipEffectsOverlay />
    <FlipPoster />
    <Teleport :to="uiState.fullscreen.value ? '#flip-player-ui' : 'body'">
      <transition name="flip-settings-transition">
        <FlipSettings v-if="uiState.settingsOpen.value" />
      </transition>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.flip-fade-enter-active,
.flip-fade-leave-active {
  transition: opacity 200ms;
}
.flip-fade-enter-from,
.flip-fade-leave-to {
  opacity: 0;
}

.flip-settings-transition-enter-active,
.flip-settings-transition-leave-active {
  transition:
    opacity 300ms $intro-easing,
    transform 300ms $intro-easing;
}
.flip-settings-transition-enter-to,
.flip-settings-transition-leave-from {
  opacity: 1;
  transform: scale(1);
}
.flip-settings-transition-enter-from,
.flip-settings-transition-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.flip-player-ui {
  max-height: calc(100vh - 170px);
  display: flex;
  background-color: #000;
  position: relative;
  cursor: v-bind(cursor);

  .flip-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  :deep(.flip-video-element) {
    margin: 0 auto;
    width: 100%;
    object-fit: contain;
  }
}
</style>
