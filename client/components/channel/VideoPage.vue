<script setup lang="ts">
import VideoEntry from '@/components/list/VideoEntry.vue';
import MultiOptionButton from '@/components/buttons/MultiOptionButton.vue';
import { ApiDto } from 'viewtube/shared';
import { SortOptionsType } from '@/utils/sortOptions';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import LoadMoreIcon from 'vue-material-design-icons/Reload.vue';

const props = withDefaults(
  defineProps<{
    videos: ApiDto<'ChannelVideosDto'>;
    sort: SortOptionsType;
    entryTypeName?: string;
    morePending?: boolean;
  }>(),
  { entryTypeName: 'videos', morePending: false }
);

const emit = defineEmits<{
  (event: 'update:sort', value: SortOptionsType): void;
  (event: 'load-more', value: void): void;
}>();

const sortBy = computed<SortOptionsType>({
  get: () => props.sort,
  set: value => emit('update:sort', value)
});
</script>

<template>
  <div v-if="videos?.items.length === 0" class="no-videos">
    <p>This channel has no {{ entryTypeName }}.</p>
  </div>
  <div v-else class="videos">
    <div class="controls">
      <div v-tippy="'Currently unavailable due to changes from YouTube'" class="controls-inner">
        <p class="sort-label">Sort by</p>
        <MultiOptionButton v-model="sortBy" :options="sortOptions" disabled />
      </div>
    </div>
    <div class="videos-container">
      <VideoEntry v-for="(video, index) in videos?.items" :key="index" :video="video" hide-author />
    </div>
    <div class="show-more">
      <BadgeButton
        v-if="videos?.continuation"
        class="show-more-button"
        :loading="morePending"
        @click.prevent="$emit('load-more')"
      >
        <LoadMoreIcon />
        <p>Show more</p>
      </BadgeButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.no-videos {
  display: flex;
  justify-content: center;
  margin: 15px 0 0 0;
}
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

  .show-more {
    display: flex;

    .show-more-button {
      margin: 15px auto 20px auto;
    }
  }
}
</style>
