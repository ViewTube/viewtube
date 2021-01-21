<template>
  <div class="playlist-entry">
    <nuxt-link
      class="playlist-entry-thmb"
      :to="{
        path: '/playlist?list=' + playlist.playlistId
      }"
    >
      <div class="thmb-image-container">
        <img
          v-if="playlist.thumbnail"
          class="playlist-entry-thmb-image"
          :src="proxyUrl + playlist.thumbnail"
          :alt="playlist.title"
        />
        <img
          v-if="playlist.playlistThumbnails"
          class="playlist-entry-thmb-image"
          :src="proxyUrl + playlist.playlistThumbnails[3].url"
          :alt="playlist.title"
        />
      </div>
      <span v-if="playlist.videoCountString" class="playlist-entry-count">{{
        playlist.videoCountString
      }}</span>
      <span v-if="playlist.videoCount" class="playlist-entry-count"
        >{{ playlist.videoCount }} videos</span
      >
    </nuxt-link>
    <div class="playlist-entry-info">
      <nuxt-link
        v-tippy="playlist.title"
        class="playlist-entry-title tooltip"
        :to="{
          path: '/playlist?list=' + playlist.playlistId
        }"
        >{{ playlist.title }}</nuxt-link
      >
      <nuxt-link
        v-tippy="playlist.author"
        class="playlist-entry-channel tooltip"
        :to="{ path: '/channel/' + playlist.authorId }"
        >{{ playlist.author }}</nuxt-link
      >
    </div>
  </div>
</template>

<script lang="ts">
import { commons } from '@/plugins/commons.ts';
import 'tippy.js/dist/tippy.css';

import Vue from 'vue';

export default Vue.extend({
  name: 'PlaylistEntry',
  props: {
    playlist: Object
  },
  data: () => ({
    proxyUrl: commons.proxyUrl
  })
});
</script>

<style lang="scss">
.playlist-entry {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  z-index: 11;
  position: relative;

  .playlist-entry-thmb {
    width: 100%;
    overflow: hidden;
    position: relative;
    box-shadow: $medium-shadow;
    z-index: 11;

    .thmb-image-container {
      position: relative;
      top: 50%;
      left: 0;
      transform: translateY(-50%);

      .playlist-entry-thmb-image {
        width: 100%;
        display: block;
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
