<template>
  <div class="vertical-shelf">
    <p class="title">{{ data.title }}</p>
    <div class="vertical-shelf-container">
      <VideoEntry v-for="video in data.items" :key="video.videoId" :video="video" />
    </div>
  </div>
</template>

<script>
import VideoEntry from '@/components/list/VideoEntry';

export default {
  name: 'VerticalShelf',
  components: {
    VideoEntry
  },
  props: {
    data: Object
  }
};
</script>

<style></style>
