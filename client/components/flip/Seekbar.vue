<script setup lang="ts">
import { getTimestampFromSeconds } from '@/utils/shared';

const videoState = inject<VideoState>('videoState');
const uiState = inject<UIState>('uiState');
const video = inject<ApiDto<'VTVideoInfoDto'>>('video');

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
    hoveredTime.value = time;
    hoveredTimestamp.value = getTimestampFromSeconds(time);
    hoverPosition.value = percent;

    if (seeking.value) {
      _currentTime.value = time;
    }
  }
};

const seekbarHovered = ref(false);
const onPointerEnter = () => {
  seekbarHovered.value = true;
};

const onPointerLeave = () => {
  seekbarHovered.value = false;
};

const onPointerUp = (e: PointerEvent) => {
  uiState.setSeeking(false);
  seeking.value = false;
  seekbarRef.value?.releasePointerCapture(e.pointerId);
  videoState.setTime(_currentTime.value);
};

const hoveredTime = ref(0);
const hoveredTimestamp = ref('00:00');
const hoverPosition = ref(0);
const hoverTimestampRef = ref<HTMLDivElement | null>(null);
const hoverChapterRef = ref<HTMLDivElement | null>(null);

const hoverTimestampPosition = computed(() => {
  hoverPosition.value;
  return getHoverPosition(hoverTimestampRef);
});

const previewThumbnailPosition = computed(() => {
  hoverPosition.value;
  return getHoverPositionByWidth(200);
});

const hoverChapterPosition = computed(() => getHoverPosition(hoverChapterRef));

const getHoverPosition = (element: Ref<HTMLDivElement>) => {
  const elWidth = element.value?.getBoundingClientRect().width;
  return getHoverPositionByWidth(elWidth);
};

const getHoverPositionByWidth = (elWidth: number) => {
  const rect = seekbarInnerRef.value?.getBoundingClientRect();
  if (!rect || !elWidth) return '0px';

  const width = rect.width;
  const hoverWidth = elWidth;
  const left = hoverPosition.value * width;
  const offset = left - hoverWidth / 2;
  if (offset < 0) return '0';
  if (offset > width - hoverWidth) return `${width - hoverWidth}px`;
  return `${offset}px`;
};

const currentChapter = computed(() => {
  if (!video.chapters?.length) return;

  const hoveredTimeMs = hoveredTime.value * 1000;
  return video.chapters.find((chapter, index) => {
    const startMs = chapter.startMs;
    const endMs = video.chapters[index + 1]?.startMs ?? videoState.video.duration * 1000;
    return startMs < hoveredTimeMs && endMs > hoveredTimeMs;
  });
});
</script>

<template>
  <div
    ref="seekbarRef"
    class="flip-seekbar-container"
    :class="{ 'flip-seekbar-hovered': seekbarHovered }"
    @pointerdown.stop.prevent="onPointerDown"
    @pointermove.stop.prevent="onPointerMove"
    @pointerup.stop.prevent="onPointerUp"
    @pointerenter.stop.prevent="onPointerEnter"
    @pointerleave.stop.prevent="onPointerLeave"
    @click.stop.prevent="() => {}"
  >
    <div ref="seekbarInnerRef" class="flip-seekbar">
      <div class="flip-seekbar-buffer seekbar-overlay" />
      <div class="flip-seekbar-progress seekbar-overlay" />
      <FlipChapters :hovered="seekbarHovered" />
      <div class="flip-seekbar-point" />
      <FlipSeekbarPreview
        class="seekbar-preview"
        :hovered-time="hoveredTime"
        :position-x="previewThumbnailPosition"
        :position-y="currentChapter ? '80px' : '59px'"
      />
      <ClientOnly>
        <div
          v-if="currentChapter"
          ref="hoverChapterRef"
          class="flip-hover-chapter flip-hover-element"
          :style="{
            transform: `translate3d(${hoverChapterPosition},0,0)`
          }"
        >
          {{ currentChapter?.title }}
        </div>
        <div
          ref="hoverTimestampRef"
          class="flip-hover-timestamp flip-hover-element"
          :style="{
            transform: `translate3d(${hoverTimestampPosition},0,0)`
          }"
        >
          {{ hoveredTimestamp }}
        </div>
      </ClientOnly>
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
  touch-action: none;

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
      max-width: 100%;
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

    .flip-hover-element {
      position: absolute;
      left: 0;
      background-color: $video-thmb-overlay-bgcolor;
      color: $video-thmb-overlay-textcolor;
      padding: 2px 6px;
      border-radius: 3px;
      user-select: none;
      pointer-events: none;
      opacity: 0;
      transition: opacity 200ms $intro-easing;
      font-size: 0.9rem;
      height: 21px;
    }

    .flip-hover-timestamp {
      bottom: 20px;
    }

    .flip-hover-chapter {
      bottom: 50px;
    }
  }

  &.flip-seekbar-hovered {
    :deep(.seekbar-preview) {
      opacity: 1;
    }

    .flip-hover-element {
      opacity: 1;
    }
    .flip-seekbar-point {
      transform: scale(1);
    }
  }
}
</style>
