<script setup lang="ts">
defineProps<{
  hovered: boolean;
}>();
const videoState = inject<VideoState>('videoState');
const video = inject<ApiDto<'VTVideoInfoDto'>>('video');

const chapters = computed(() => {
  const videoLength = videoState.video.duration;
  const videoLengthMs = videoLength * 1000;

  return video.chapters?.slice(1).map(chapter => ({
    ...chapter,
    posLeft: `${(chapter.startMs / videoLengthMs) * 100}%`
  }));
});
</script>

<template>
  <div v-if="chapters?.length > 0" class="flip-chapters" :class="{ hovered: hovered }">
    <div
      v-for="(chapter, index) in chapters"
      :key="index"
      class="flip-chapter"
      :style="{ left: chapter.posLeft }"
    />
  </div>
</template>

<style lang="scss" scoped>
.flip-chapters {
  position: absolute;
  left: 0;
  right: 0;

  &.hovered {
    .flip-chapter {
      height: 9px;
      background-color: var(--line-accent-color-dark);
    }
  }

  .flip-chapter {
    position: absolute;
    height: 3px;
    width: 3px;
    background-color: var(--line-accent-color);
    bottom: 2px;
    transition: height 300ms $intro-easing;
    border-radius: 5px;
  }
}
</style>
