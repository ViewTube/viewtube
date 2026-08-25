<script setup lang="ts">
const route = useRoute();

const channelId = computed(() => getChannelIdFromParam(route.params.id));
const sortBy = ref<ChannelVideosSortOptionsType>('newest');
const filter = ref<ChannelVideosFilterOptionsType>('public');

const { data, pending } = useGetChannelVideos(channelId, { sortBy, filter });

const { moreVideosPending, onLoadMore, feed } = useChannelVideosContinuation(data);
</script>

<template>
  <Spinner v-if="pending" />
  <ChannelVideoPage
    v-if="feed && !pending"
    v-model:sort="sortBy"
    v-model:filter="filter"
    :entries="feed.videos"
    :continuation="feed.continuation"
    :available-filters="feed.availableFilters"
    :more-pending="moreVideosPending"
    :sort-options="channelVideosSortOptions"
    @load-more="onLoadMore"
  />
</template>
