<template>
  <div class="next-up-container">
    <p class="next-up-title">Next up{{ remainingTimeString }}</p>
    <nuxt-link
      :to="{
        path: fullPath,
        query: { v: video.videoId }
      }"
      class="next-up-video"
    >
      <div class="next-up-video-thumbnail">
        <img
          class="next-up-thumbnail"
          crossorigin="anonymous"
          :src="imgProxyUrl + video.videoThumbnails[4].url"
          :alt="video.title"
        />
      </div>
      <div class="next-up-video-info">
        <p v-tippy="video.title" class="title">
          {{ video.title }}
        </p>
        <p v-tippy="video.author" class="channel">{{ video.author }}</p>
        <p class="views">{{ video.viewCount.toLocaleString('en-US') }} views</p>
      </div>
    </nuxt-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, useRoute } from '#imports';
import { useImgProxy } from '@/plugins/proxy';
import { createComputed } from '@/plugins/computed';
import { useAccessor } from '@/hooks/accessor';

export default defineComponent({
  props: {
    video: Object
  },
  setup() {
    const imgProxy = useImgProxy();
    const route = useRoute();
    const accessor = useAccessor();

    const remainingTimeString = createComputed(() => {
      const remaining = accessor.videoPlayer.videoLength - accessor.videoPlayer.currentTime;
      if (remaining <= 30) {
        return ` in ${Math.floor(remaining)}s`;
      }
      return '';
    });

    return {
      imgProxyUrl: imgProxy.url,
      fullPath: route.fullPath,
      remainingTimeString
    };
  }
});
</script>

<style lang="scss">
.next-up-container {
  border-radius: 5px;
  background-color: var(--bgcolor-alt);
  margin: 10px 5px 0 5px;
  box-sizing: border-box;
  padding: 5px 10px 10px 10px;

  .next-up-title {
    font-size: 0.8rem;
    margin: 0 0 5px 0;
  }
  .next-up-video {
    display: flex;

    .next-up-video-thumbnail {
      $thumbnail-width: 100px;
      position: relative;
      padding-right: $thumbnail-width;
      padding-bottom: math.div($thumbnail-width, 16) * 9;
      width: 0;
      overflow: hidden;

      .next-up-thumbnail {
        position: absolute;
        width: 100%;
      }
    }
    .next-up-video-info {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      margin: 0 0 0 10px;

      .title {
        font-size: 0.9rem;
        color: var(--title-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .channel {
        font-weight: 700;
        font-size: 0.85rem;
        color: var(--subtitle-color);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .views {
        font-size: 0.8rem;
        color: var(--subtitle-color-light);
      }
    }
  }
}
</style>
