<script setup lang="ts">
const route = useRoute();
const channelId = computed(() => getChannelIdFromParam(route.params.id));

const { data } = useGetChannelVideos(channelId);
</script>

<template>
  <div>{{ data }}</div>
</template>
