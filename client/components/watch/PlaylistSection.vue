<template>
  <div class="playlist-section">
    <div class="control-section">// control</div>
    <div class="video-section">
      <nuxt-link
        v-for="(video, i) in playlist.items"
        :key="i"
        :to="`/watch?v=${video.id}&list=${playlist.id}`"
        class="video"
        :class="{ current: video.id === currentVideoId }"
      >
        <div class="thumbnail">
          <img :src="imgProxyUrl + video.thumbnails[3].url" alt="Playlist video thumbnail" />
        </div>
        <div class="info">
          <p class="title">
            {{ video.title }}
          </p>
          <p class="author">
            {{ video.author.name }}
          </p>
        </div>
      </nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';
import { Result } from 'ytpl';
import { useImgProxy } from '~/plugins/proxy';

export default defineComponent({
  name: 'PlaylistSection',
  props: {
    playlist: Object as PropType<Result>,
    currentVideoId: String
  },
  setup() {
    const imgProxy = useImgProxy();

    return {
      imgProxyUrl: imgProxy.url
    };
  }
});
</script>

<style lang="scss">
.playlist-section {
  .control-section {
  }
  .video-section {
    display: flex;
    flex-direction: column;
    width: 100%;

    .video {
      display: flex;
      flex-direction: row;
      width: 100%;

      &.current {
        background-color: var(--bgcolor-alt-light);
      }

      .thumbnail {
        img {
          height: 48px;
        }
      }
      .info {
        .title {
        }
        .author {
        }
      }
    }
  }
}
</style>
