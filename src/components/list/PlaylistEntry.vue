<template>
  <div class="playlist-entry">
    <router-link class="playlist-entry-thmb" :to="{path: '/watch?v=' + playlist.videos[0].videoId}">
      <div class="thmb-image-loader">
        <img class="playlist-entry-thmb-image" :src="playlist.videos[0].videoThumbnails[2].url" />
      </div>
      <span class="playlist-entry-count">{{ playlist.videoCount }} videos</span>
    </router-link>
    <div class="playlist-entry-info">
      <router-link
        class="playlist-entry-title tooltip"
        :to="{path: '/watch?v=' + playlist.videos[0].videoId}"
        :data-tippy-content="playlist.title"
      >{{ playlist.title }}</router-link>
      <router-link
        class="playlist-entry-channel tooltip"
        :to="{path: '/channel/' + playlist.authorId}"
        :data-tippy-content="playlist.author"
      >{{ playlist.author }}</router-link>
    </div>
  </div>
</template>

<script>
import tippy from 'tippy.js'

export default {
  name: 'playlist-entry',
  props: {
    playlist: Object
  },
  mounted () {
    tippy('.tooltip', {
      animation: 'shift-away',
      animateFill: false,
      duration: 300,
      arrow: false,
      delay: [500, 100],
      touchHold: true,
      placement: 'bottom'
    })
  }
}
</script>

<style lang="scss">
.playlist-entry {
  width: 220px;
  display: flex;
  flex-direction: column;
  margin: 10px;
  justify-content: flex-start;
  overflow: hidden;
  box-sizing: border-box;

  .playlist-entry-thmb {
    width: 100%;
    height: 124px;
    overflow: hidden;
    position: relative;

    .thmb-image-loader {
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
    padding: 0 0 10px 0;
    font-family: $default-font;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: left;

    .playlist-entry-title {
      text-decoration: none;
      margin: 0;
      font-size: 0.9rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: $title-color;
      padding: 6px 0 4px 0;
    }

    .playlist-entry-channel {
      text-decoration: none;
      padding: 3px 0 4px 0;
      font-size: 0.8rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: $subtitle-color;
    }
  }

  @media screen and (max-width: $mobile-width) {
    width: calc(100% - 20px);
    margin: 10px;

    .playlist-entry-thmb {
      width: 100%;
      height: unset;

      .thmb-image-loader {
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
