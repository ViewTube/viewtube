<script setup lang="ts">
import { ApiDto } from 'viewtube/shared';

defineProps<{
  featuredVideo: ApiDto<'ChannelHomeDto'>['featuredVideo'];
}>();
</script>

<template>
  <div class="featured-video">
    <div class="video-embed">
      <iframe class="video-embed-iframe" :src="`/embed/${featuredVideo?.videoId}`" />
    </div>
  </div>
</template>

<style lang="scss">
.featured-video {
  display: grid;
  grid-template-areas: 'video video info';
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 36.5vw; // vw to keep the height of the embed

  .video-embed {
    grid-area: video;

    .video-embed-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  }
}
</style>
