<script setup lang="ts">
import { SortOptionsType } from '@/utils/sortOptions';
const route = useRoute();

const channelId = computed(() => getChannelIdFromParam(route.params.id));
const sortBy = ref<SortOptionsType>('newest');

const { data, pending } = useGetChannelVideos(channelId, { sortBy });

const { moreVideosPending, onLoadMore, videos } = useChannelVideosContinuation(data);
</script>

<template>
  <Spinner v-if="pending" />
  <ChannelVideoPage
    v-if="videos && !pending"
    v-model:sort="sortBy"
    :videos="videos"
    :more-pending="moreVideosPending"
    @load-more="onLoadMore"
  />
</template>
