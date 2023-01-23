<script setup lang="ts">
import VideoEntry from '@/components/list/VideoEntry.vue';
import MultiOptionButton from '@/components/buttons/MultiOptionButton.vue';
import { ApiDto } from 'viewtube/shared';
import { SortOptionsType } from '@/utils/sortOptions';

const props = defineProps<{
  videos: ApiDto<'ChannelVideosDto'>;
  sort: SortOptionsType;
}>();

const emit = defineEmits<{
  (event: 'update:sort', value: SortOptionsType): void;
}>();

const sortBy = computed<SortOptionsType>({
  get: () => props.sort,
  set: value => emit('update:sort', value)
});
</script>

<template>
  <div class="videos">
    <div class="controls">
      <div v-tippy="'Currently unavailable due to changes from YouTube'" class="controls-inner">
        <p class="sort-label">Sort by</p>
        <MultiOptionButton v-model="sortBy" :options="sortOptions" disabled />
      </div>
    </div>
    <div class="videos-container">
      <VideoEntry v-for="(video, index) in videos?.items" :key="index" :video="video" hide-author />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.videos {
  margin: 15px 0 0 0;

  .controls {
    display: flex;
    justify-content: flex-end;
    padding: 0 15px;
    margin: 0 0 15px 0;

    .controls-inner {
      display: flex;
      gap: 10px;

      .sort-label {
        display: flex;
        align-items: center;
      }
    }
  }

  .videos-container {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    padding: 0 15px;
    box-sizing: border-box;
    z-index: 10;
    background-color: var(--bgcolor-main);
    @include viewtube-grid;
  }
}
</style>
