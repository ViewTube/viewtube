<script setup lang="ts">
import type { ApiDto } from '@viewtube/shared';
import BadgeButton from '~/components/buttons/BadgeButton.vue';
import MultiOptionButton from '~/components/buttons/MultiOptionButton.vue';
import PlaylistEntry from '~/components/list/PlaylistEntry.vue';
import VideoEntry from '~/components/list/VideoEntry.vue';

const props = withDefaults(
  defineProps<{
    entries: Array<ApiDto<'VTVideoDto'>> | Array<ApiDto<'VTPlaylistDto'>>;
    continuation?: string;
    sort?: ChannelVideosSortOptionsType;
    sortOptions?: { value: string; label: string }[];
    filter?: ChannelVideosFilterOptionsType;
    /** Left empty when YouTube offers no content filter, which hides the control. */
    availableFilters?: Array<string>;
    entryTypeName?: string;
    morePending?: boolean;
    entryType?: 'videos' | 'playlists';
  }>(),
  { entryTypeName: 'videos', morePending: false, entryType: 'videos' }
);

const emit = defineEmits<{
  (event: 'update:sort', value: ChannelVideosSortOptionsType): void;
  (event: 'update:filter', value: ChannelVideosFilterOptionsType): void;
  (event: 'load-more'): void;
}>();

const sortBy = computed({
  get: () => props.sort,
  set: value => emit('update:sort', value)
});

const filterBy = computed({
  get: () => props.filter,
  set: value => emit('update:filter', value)
});

const filterOptions = computed(() =>
  channelVideosFilterOptions.filter(option => props.availableFilters?.includes(option.value))
);

const showFilter = computed(() => filterOptions.value.length > 1);
</script>

<template>
  <div v-if="entries?.length === 0" class="no-videos">
    <p>This channel has no {{ entryTypeName }}.</p>
  </div>
  <div v-else class="videos">
    <div v-if="sortOptions || showFilter" class="controls">
      <div class="controls-inner">
        <template v-if="showFilter">
          <p class="sort-label">Show</p>
          <MultiOptionButton v-model="filterBy" :options="filterOptions" />
        </template>
        <template v-if="sortOptions">
          <p class="sort-label">Sort by</p>
          <MultiOptionButton v-model="sortBy" :options="sortOptions" />
        </template>
      </div>
    </div>
    <div v-if="entryType === 'videos'" class="videos-container">
      <VideoEntry
        v-for="(video, index) in entries as Array<ApiDto<'VTVideoDto'>>"
        :key="index"
        :video="video"
        hide-author
      />
    </div>
    <div v-else class="videos-container">
      <PlaylistEntry
        v-for="(playlist, index) in entries as Array<ApiDto<'VTPlaylistDto'>>"
        :key="index"
        :playlist="playlist"
        hide-author
      />
    </div>
    <div class="show-more">
      <BadgeButton
        v-if="continuation"
        class="show-more-button"
        :loading="morePending"
        @click.prevent="$emit('load-more')"
      >
        <VTIcon name="mdi:reload" />
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
  height: 90vh;
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
    max-width: variables.$main-width;
    margin: 0 auto;
    padding: 0 15px;
    box-sizing: border-box;
    background-color: var(--bgcolor-main);
    @include mixins.viewtube-grid;
  }

  .show-more {
    display: flex;

    .show-more-button {
      margin: 15px auto 20px auto;
    }
  }
}
</style>
