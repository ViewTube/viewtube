<script setup lang="ts">
defineProps<{
  postVideo: {
    videoId: string;
    title: string;
    description: string;
    publishedText: string;
    lengthText: string;
    viewCountText: string;
    badges: {
      verified: boolean;
      officialArtist: boolean;
    };
    author: string;
    authorId: string;
    thumbnails: Array<{ url: string; width: number; height: number }>;
  };
}>();

const { proxyUrl } = useImgProxy();
</script>

<template>
  <nuxt-link class="post-video" :to="`/watch?v=${postVideo.videoId}`">
    <div class="thumbnail">
      <img class="thumbnail-img" :src="proxyUrl(postVideo.thumbnails[0].url)" />
    </div>
    <div class="video-info">
      <p v-tippy="postVideo.title" class="title info-element">
        {{ postVideo.title }}
      </p>
      <p v-tippy="postVideo.author" class="author info-element">
        {{ postVideo.author }}
        <VTIcon v-if="postVideo.badges.verified" name="mdi:check-decagram" />
      </p>
      <p class="video-additional-info info-element">
        {{ postVideo.publishedText }} &bull; {{ postVideo.viewCountText }}
      </p>
    </div>
  </nuxt-link>
</template>

<style lang="scss" scoped>
.post-video {
  display: flex;
  border-radius: 8px;
  background-color: var(--bgcolor-main);
  overflow: hidden;
  gap: 10px;

  .thumbnail {
    object-fit: scale-down;
    flex: 1;
    max-width: 33%;

    .thumbnail-img {
      width: 100%;
      display: block;
    }
  }

  .video-info {
    grid-area: info;
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 5px 0;
    max-width: 66%;

    .info-element {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .title {
      font-size: 0.9rem;
      color: var(--title-color);
    }

    .author {
      font-size: 0.8rem;
      color: var(--subtitle-color-light);
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 2px;

      :deep(.vt-icon) {
        width: 0.8rem;
        height: 0.8rem;
        margin-bottom: 1px;
      }
    }

    .video-additional-info {
      font-size: 0.8rem;
      color: var(--subtitle-color-light);
    }
  }
}
</style>
