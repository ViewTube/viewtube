<script setup lang="ts">
const route = useRoute();

const channelId = computed(() => getChannelIdFromParam(route.params.id));
const sortBy = ref<ChannelVideosSortOptionsType>('newest');

const { data, pending } = useGetChannelShorts(channelId, { sortBy });

const { moreVideosPending, onLoadMore, feed } = useChannelVideosContinuation(data);
</script>

<template>
  <Spinner v-if="pending" />
  <ChannelVideoPage
    v-if="feed && !pending"
    v-model:sort="sortBy"
    :entries="feed.videos"
    :continuation="feed.continuation"
    :more-pending="moreVideosPending"
    :sort-options="channelVideosSortOptions"
    entry-type-name="shorts"
    @load-more="onLoadMore"
  />
</template>
