<script setup lang="ts">
import { getTimestampFromSeconds } from '@/utils/shared';

const videoState = inject<VideoState>('videoState');
const uiState = inject<UIState>('uiState');

const _currentTime = ref(videoState.video.currentTime);
watch(
  () => videoState.video.currentTime,
  newVal => {
    if (!seeking.value) {
      _currentTime.value = newVal;
    }
  }
);

const bufferWidth = computed(
  () =>
    `${
      ((videoState.video.currentTime + videoState.video.bufferLevel) / videoState.video.duration) *
      100
    }%`
);

const currentTimeWidth = computed(
  () => `${(_currentTime.value / videoState.video.duration) * 100}%`
);

const seekbarRef = ref<HTMLDivElement | null>(null);
const seekbarInnerRef = ref<HTMLDivElement | null>(null);
const seeking = ref(false);

const onPointerDown = (e: PointerEvent) => {
  uiState.setSeeking(true);
  seeking.value = true;
  seekbarRef.value?.setPointerCapture(e.pointerId);
  onPointerMove(e);
};

const onPointerMove = (e: PointerEvent) => {
  const rect = seekbarInnerRef.value?.getBoundingClientRect();
  if (rect) {
    const x = e.clientX - rect.left;
    const width = rect.width;
    let percent = x / width;
    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;
    const time = videoState.video.duration * percent;
    hoveredTime.value = getTimestampFromSeconds(time);
    hoverPosition.value = percent;

    if (seeking.value) {
      _currentTime.value = time;
    }
  }
};

const onPointerUp = (e: PointerEvent) => {
  uiState.setSeeking(false);
  seeking.value = false;
  seekbarRef.value?.releasePointerCapture(e.pointerId);
  videoState.setTime(_currentTime.value);
};

const hoveredTime = ref('00:00');
const hoverPosition = ref(0);
const hoverTimestampRef = ref<HTMLDivElement | null>(null);

const hoverPositionStyle = computed(() => {
  const rect = seekbarInnerRef.value?.getBoundingClientRect();
  if (rect && hoverTimestampRef.value) {
    const width = rect.width;
    const hoverWidth = hoverTimestampRef.value.getBoundingClientRect().width;
    const left = hoverPosition.value * width;
    const offset = left - hoverWidth / 2;
    if (offset < 0) return '0';
    if (offset > width - hoverWidth) return `calc(100% - ${hoverWidth}px)`;
    return `${offset}px`;
  }
});
</script>

<template>
  <div
    ref="seekbarRef"
    class="flip-seekbar-container"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @click.stop="() => {}"
  >
    <div ref="seekbarInnerRef" class="flip-seekbar">
      <div class="flip-seekbar-buffer seekbar-overlay" />
      <div class="flip-seekbar-progress seekbar-overlay" />
      <div class="flip-seekbar-point" />
      <div ref="hoverTimestampRef" class="flip-hover-timestamp">{{ hoveredTime }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.flip-seekbar-container {
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
  pointer-events: auto;
  cursor: pointer;
  user-select: none;

  .flip-seekbar {
    width: calc(100% - 30px);
    margin: auto;
    background-color: var(--line-color);
    height: 4px;
    border-radius: 25px;
    position: relative;

    .seekbar-overlay {
      position: absolute;
      top: 0;
      bottom: 0;
      border-radius: 25px;
      height: 100%;
    }

    .flip-seekbar-buffer {
      background-color: var(--line-accent-color);
      width: v-bind(bufferWidth);
    }

    .flip-seekbar-progress {
      background-color: var(--theme-color);
      width: v-bind(currentTimeWidth);
    }

    .flip-seekbar-point {
      left: calc(v-bind(currentTimeWidth) - 6px);
      top: -4px;
      position: absolute;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: var(--theme-color);
      transform: scale(0);
      transition: transform 300ms $intro-easing;
    }

    .flip-hover-timestamp {
      position: absolute;
      bottom: 10px;
      left: v-bind(hoverPositionStyle);
      background-color: $video-thmb-overlay-bgcolor;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.9rem;
      opacity: 0;
      user-select: none;
      pointer-events: none;
      transition: opacity 200ms $intro-easing;
    }
  }

  &:hover {
    .flip-hover-timestamp {
      opacity: 1;
    }
    .flip-seekbar-point {
      transform: scale(1);
    }
  }
}
</style>
