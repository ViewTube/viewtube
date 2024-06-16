<script setup lang="ts">
const route = useRoute();

const channelId = computed(() => getChannelIdFromParam(route.params.id));
const sortBy = ref<ChannelPlaylistsSortOptionsType>('last');

const { data, pending } = useGetChannelPlaylists(channelId, { sortBy });

const { moreVideosPending, onLoadMore, videos } = useChannelPlaylistsContinuation(data);
</script>

<template>
  <Spinner v-if="pending" />
  <ChannelVideoPage
    v-if="videos && !pending"
    v-model:sort="sortBy"
    :videos="videos"
    :more-pending="moreVideosPending"
    :entry-type-name="'Playlists'"
    entry-type="playlists"
    :sort-options="channelPlaylistsSortOptions"
    @load-more="onLoadMore"
  />
</template>
