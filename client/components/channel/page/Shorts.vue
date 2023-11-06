<script setup lang="ts">
const route = useRoute();

const channelId = computed(() => getChannelIdFromParam(route.params.id));
const sortBy = ref<ChannelVideosSortOptionsType>('newest');

const { data, pending } = useGetChannelShorts(channelId, { sortBy });

const { moreVideosPending, onLoadMore, videos } = useChannelVideosContinuation(data);
</script>

<template>
  <Spinner v-if="pending" />
  <ChannelVideoPage
    v-if="videos && !pending"
    v-model:sort="sortBy"
    :videos="videos"
    :more-pending="moreVideosPending"
    :sort-options="channelVideosSortOptions"
    :sort-disabled="true"
    entry-type-name="shorts"
    @load-more="onLoadMore"
  />
</template>
