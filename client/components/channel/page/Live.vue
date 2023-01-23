<script setup lang="ts">
import { SortOptionsType } from '@/utils/sortOptions';

const route = useRoute();
const channelId = computed(() => getChannelIdFromParam(route.params.id));

const sortBy = ref<SortOptionsType>('newest');

const { data, refresh } = useGetChannelVideos(channelId, { sortBy });

watch(sortBy, () => refresh());
</script>

<template>
  <ChannelVideoPage v-model:sort="sortBy" :videos="data" />
</template>
