<template>
  <div class="playlist-entry">
    <div class="playlist-entry-background"></div>
    <nuxt-link
      class="playlist-entry-thmb"
      :to="{path: '/watch?v=' + playlist.videos[0].videoId}"
    >
      <div class="thmb-image-container">
        <img
          class="playlist-entry-thmb-image"
          :src="commons.proxyUrl + playlist.videos[0].videoThumbnails[2].url"
          :alt="playlist.title"
        />
      </div>
      <span class="playlist-entry-count">{{ playlist.videoCount }} videos</span>
    </nuxt-link>
    <div class="playlist-entry-info">
      <nuxt-link
        class="playlist-entry-title tooltip"
        :to="{path: '/watch?v=' + playlist.videos[0].videoId}"
        :data-tippy-content="playlist.title"
      >{{ playlist.title }}</nuxt-link>
      <nuxt-link
        class="playlist-entry-channel tooltip"
        :to="{path: '/channel/' + playlist.authorId}"
        :data-tippy-content="playlist.author"
      >{{ playlist.author }}</nuxt-link>
    </div>
  </div>
</template>

<script>
import Commons from '@/plugins/commons.js'
import 'tippy.js/dist/tippy.css'

export default {
  name: 'playlist-entry',
  props: {
    playlist: Object
  },
  data: () => ({
    commons: Commons
  }),
  mounted() {
  }
}
</script>

<style lang="scss">
.playlist-entry {
  width: 320px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  justify-content: flex-start;
  z-index: 11;
  position: relative;

  .playlist-entry-background {
    position: absolute;
    height: 175px;
    top: 10px;
    left: 10px;
    width: calc(100% - 20px);
    background-color: #34363b;
    z-index: 10;
    transition-duration: 300ms;
    transition-timing-function: $intro-easing;
    transition-property: box-shadow;
  }

  .playlist-entry-thmb {
    width: 100%;
    height: 175px;
    overflow: hidden;
    position: relative;
    box-shadow: $max-shadow;
    z-index: 11;

    .thmb-image-container {
      position: relative;
      top: 50%;
      left: 0;
      transform: translateY(-50%);

      .playlist-entry-thmb-image {
        width: 100%;
      }
    }
    .playlist-entry-count {
      text-decoration: none;
      color: $video-thmb-overlay-textcolor;
      position: absolute;
      right: 0;
      bottom: 0;
      padding: 2px 4px;
      margin: 8px 4px;
      background-color: $video-thmb-overlay-bgcolor;
      box-sizing: border-box;
      border-radius: 2px;
      font-family: $default-font;
    }
  }

  .playlist-entry-info {
    padding: 10px 0 10px 0;
    font-family: $default-font;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: left;
    z-index: 11;

    .playlist-entry-title {
      text-decoration: none;
      margin: 0;
      font-size: 0.9rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--title-color);
      padding: 6px 0 4px 0;
    }

    .playlist-entry-channel {
      text-decoration: none;
      padding: 3px 0 4px 0;
      font-size: 0.9rem;
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--subtitle-color);
    }
  }

  @media screen and (max-width: $mobile-width) {
    width: calc(100% - 20px);
    margin: 10px;

    .playlist-entry-thmb {
      width: 100%;
      height: 53vw;

      .thmb-image-container {
        position: relative;
        top: 0;
        left: 0;
        transform: translateY(0);

        .playlist-entry-thmb-image {
          top: 0;
          transform: translateY(0px);
        }
      }
    }
  }
}
</style>
