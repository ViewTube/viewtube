<script setup lang="ts">
const route = useRoute();

const channelId = computed(() => getChannelIdFromParam(route.params.id));

const { data, pending } = useGetChannelPlaylists(channelId);

const { morePlaylistsPending, onLoadMore, feed } = useChannelPlaylistsContinuation(data);
</script>

<template>
  <Spinner v-if="pending" />
  <ChannelVideoPage
    v-if="feed && !pending"
    :entries="feed.playlists"
    :continuation="feed.continuation"
    :more-pending="morePlaylistsPending"
    entry-type="playlists"
    entry-type-name="playlists"
    @load-more="onLoadMore"
  />
</template>
