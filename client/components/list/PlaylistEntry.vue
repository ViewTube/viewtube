<template>
  <div class="playlist-entry">
    <nuxt-link
      class="playlist-entry-thmb"
      :to="{
        path: playlistLink
      }"
    >
      <div class="thmb-image-container">
        <img
          v-if="playlist.thumbnail"
          class="playlist-entry-thmb-image"
          :src="imgProxyUrl + playlist.thumbnail"
          :alt="playlist.title"
        />
        <img
          v-if="playlist.playlistThumbnails"
          class="playlist-entry-thmb-image"
          :src="imgProxyUrl + playlist.playlistThumbnails[3].url"
          :alt="playlist.title"
        />
        <img
          v-if="playlist.firstVideo && playlist.firstVideo.thumbnails"
          class="playlist-entry-thmb-image"
          :src="imgProxyUrl + playlist.firstVideo.thumbnails[0].url"
          :alt="playlist.title"
        />
      </div>
      <div class="playlist-entry-count">
        <PlaylistIcon class="playlist-icon" />
        <span v-if="playlist.videoCountString" class="count-text">{{
          playlist.videoCountString
        }}</span>
        <span v-if="playlist['length']" class="count-text">{{ playlist['length'] }} videos</span>
        <span v-if="playlist.videoCount" class="count-text"
          ><PlaylistIcon class="playlist-icon" />{{ playlist.videoCount }} videos</span
        >
      </div>
    </nuxt-link>
    <div class="playlist-entry-info">
      <nuxt-link
        v-tippy="playlist.title"
        class="playlist-entry-title tooltip"
        :to="{
          path: playlistLink
        }"
        >{{ playlist.title }}</nuxt-link
      >
      <div class="channel-name-container">
        <nuxt-link
          v-if="playlist.author"
          v-tippy="playlist.author"
          class="playlist-entry-channel tooltip"
          :to="{
            path: '/channel/' + playlist.authorId
          }"
          >{{ playlist.author }}</nuxt-link
        >
        <nuxt-link
          v-if="playlist.owner"
          v-tippy="playlist.owner.name"
          class="playlist-entry-channel tooltip"
          :to="{
            path: '/channel/' + playlist.owner.channelID
          }"
          >{{ playlist.owner.name }}</nuxt-link
        >
        <VerifiedIcon
          v-if="playlist.owner && playlist.owner.verified"
          v-tippy="'Verified'"
          class="tooltip"
          title=""
        />
      </div>
      <div v-if="playlist.publishedAt" class="video-entry-stats">
        <p>{{ playlist.publishedAt }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import VerifiedIcon from 'vue-material-design-icons/CheckDecagram.vue';
import PlaylistIcon from 'vue-material-design-icons/PlaylistPlay.vue';
import { computed, defineComponent } from '@nuxtjs/composition-api';
import { useImgProxy } from '@/plugins/proxy';

export default defineComponent({
  name: 'PlaylistEntry',
  components: {
    VerifiedIcon,
    PlaylistIcon
  },
  props: {
    playlist: Object
  },
  setup(props) {
    const imgProxy = useImgProxy();

    const playlistLink = computed((): string => {
      return `/playlist?list=${
        props.playlist.playlistId ? props.playlist.playlistId : props.playlist.playlistID
      }`;
    });

    return {
      imgProxyUrl: imgProxy.url,
      playlistLink
    };
  }
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
    overflow: hidden;
    position: relative;
    box-shadow: $medium-shadow;
    z-index: 11;

    .thmb-image-container {
      position: relative;
      width: 100%;
      top: 50%;
      left: 0;
      transform: translateY(-50%);

      .playlist-entry-thmb-image {
        max-width: 100%;
        min-width: 100%;
        display: block;
      }
    }
    .playlist-entry-count {
      text-decoration: none;
      color: $video-thmb-overlay-textcolor;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      padding: 5px 12px;
      background-color: $video-thmb-overlay-bgcolor;
      box-sizing: border-box;
      border-radius: 5px;
      font-family: $default-font;
      display: flex;
      flex-direction: row;
      align-items: center;

      .count-text {
        margin: 0 0 0 10px;
      }

      .playlist-icon {
        width: 36px;
        height: 36px;

        .material-design-icon__svg {
          width: 36px;
          height: 36px;
        }
      }
    }
  }

  .playlist-entry-info {
    padding: 10px 0 10px 0;
    font-family: $default-font;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
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

    .channel-name-container {
      display: flex;
      flex-direction: row;

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

      .material-design-icon {
        width: 14px;
        height: 14px;
        top: 3px;
        margin: 0 0 0 4px;

        .material-design-icon__svg {
          width: 14px;
          height: 14px;
        }
      }
    }
    .video-entry-stats {
      color: var(--subtitle-color-light);
      font-size: 0.8rem;
      margin: 5px 0 0 0;
    }
  }
}
</style>
