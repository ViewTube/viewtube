<script setup lang="ts">
import VideoEntry from '@/components/list/VideoEntry.vue';

const route = useRoute();
const channelId = computed(() => getChannelIdFromParam(route.params.id));

const { data } = useGetChannelVideos(channelId);
</script>

<template>
  <div class="videos">
    <div class="videos-container">
      <VideoEntry v-for="(video, index) in data?.items" :key="index" :video="video" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.videos {
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
}
</style>