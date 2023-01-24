<script setup lang="ts">
import { ApiDto } from 'viewtube/shared';

defineProps<{
  featuredVideo: ApiDto<'ChannelHomeDto'>['featuredVideo'];
}>();

const placeholderVisible = ref(true);

const hidePlaceholder = () => {
  placeholderVisible.value = false;
};
</script>

<template>
  <div class="featured-video">
    <div class="video-embed">
      <div v-if="placeholderVisible" class="video-embed-placeholder" @click="hidePlaceholder" />
      <iframe v-else class="video-embed-iframe" :src="`/embed/${featuredVideo?.videoId}`" />
    </div>
    <div class="video-info">
      <nuxt-link :to="`/watch/${featuredVideo?.videoId}`" class="video-title-link">
        <h2 class="video-title">{{ featuredVideo?.title }}</h2>
      </nuxt-link>
      <p class="video-viewcount">{{ featuredVideo?.viewCount?.toLocaleString('en-US') }} views</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.featured-video {
  display: grid;
  grid-template-areas: 'video video info';
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: calc(100vw / 3 * 2 / 16 * 9);
  column-gap: 10px;

  @media screen and (min-width: $main-width) {
    grid-template-rows: calc(#{$main-width} / 3 * 2 / 16 * 9);
  }

  .video-embed {
    grid-area: video;

    .video-embed-placeholder {
      width: 100%;
      height: 100%;
    }

    .video-embed-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  }
}
</style>
