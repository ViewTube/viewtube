<template>
  <div class="video-entry">
    <div class="video-entry-background" />
    <div class="description-btn-container">
      <div v-ripple v-tippy="'Show description'" class="description-btn">
        <InfoIcon />
      </div>
    </div>
    <input id="show-description" type="checkbox" name="show-description" />
    <nuxt-link
      v-tippy="videoProgressTooltip"
      class="video-entry-thmb"
      :to="{ path: '/watch?v=' + video.videoId }"
      :class="{ 'has-description': video.description }"
    >
      <div class="thmb-image-container">
        <div class="thmb-clip">
          <img
            class="video-entry-thmb-image"
            loading="lazy"
            :src="commons.proxyUrl + video.videoThumbnails[4].url"
            :alt="video.title"
          />
        </div>
        <div v-if="video.description" class="video-description-overlay">
          <p>{{ video.description }}</p>
        </div>
      </div>
      <div class="video-saved-progress" :style="{ width: `${videoProgressPercentage}%` }" />
      <span v-if="video.lengthSeconds" class="video-entry-length">{{
        $formatting.getTimestampFromSeconds(video.lengthSeconds)
      }}</span>
      <span v-if="video.lengthString" class="video-entry-length">{{ video.lengthString }}</span>
    </nuxt-link>

    <div class="video-entry-info">
      <img
        v-if="video.authorThumbnails"
        class="author-thumbnail"
        :src="commons.proxyUrl + video.authorThumbnails[1].url"
        alt="Author thumbnail"
      />
      <div class="video-info-text">
        <nuxt-link
          v-tippy="video.title"
          class="video-entry-title"
          :to="{ path: '/watch?v=' + video.videoId }"
          >{{ video.title }}</nuxt-link
        >
        <nuxt-link
          v-tippy="video.author"
          class="video-entry-channel"
          :to="{ path: '/channel/' + video.authorId }"
          >{{ video.author }}</nuxt-link
        >
        <div class="video-entry-stats">
          <p v-if="video.viewCount !== null" class="video-entry-views">
            {{ video.viewCount.toLocaleString('en-US') }}
            {{ video.viewCount === 1 ? 'view' : 'views' }}
          </p>
          <p class="video-entry-timestamp">
            {{ video.publishedText }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import 'tippy.js/dist/tippy.css';
import InfoIcon from 'vue-material-design-icons/Information';
import SavedPosition from '@/store/videoProgress';
import Commons from '@/plugins/commons.js';

export default {
  name: 'VideoEntry',
  components: {
    InfoIcon
  },
  props: {
    video: Object
  },
  data: () => ({
    commons: Commons
  }),
  computed: {
    videoProgressPercentage() {
      return (SavedPosition.getSavedPosition(this.video.videoId) / this.video.lengthSeconds) * 100;
    },
    videoProgressTooltip() {
      const watchTime = this.$formatting.getTimestampFromSeconds(
        SavedPosition.getSavedPosition(this.video.videoId)
      );
      const totalTime = this.$formatting.getTimestampFromSeconds(this.video.lengthSeconds);
      return `${watchTime} of ${totalTime}`;
    }
  },
  mounted() {}
};
</script>

<style lang="scss">
.video-entry {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  z-index: 11;
  position: relative;

  .video-entry-background {
    position: absolute;
    top: 10px;
    left: 10px;
    // background-color: #34363b;
    z-index: 10;
    transition-duration: 300ms;
    transition-timing-function: $intro-easing;
    transition-property: box-shadow;
  }

  &:hover {
    .description-btn-container {
      opacity: 1;
      transform: scale(1);
    }
  }

  .description-btn-container {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 12;
    width: 44px;
    height: 44px;
    padding: 10px;
    margin: 5px;
    opacity: 0;
    transform: scale(0.8);
    background-color: $video-thmb-overlay-bgcolor;
    border-radius: 5px;
    box-sizing: border-box;
    cursor: pointer;
    transition: opacity 200ms $intro-easing, transform 200ms $intro-easing;
  }

  #show-description {
    position: absolute;
    top: 2px;
    right: 2px;
    z-index: 13;
    opacity: 0;
    width: 50px;
    height: 50px;
    cursor: pointer;
  }

  #show-description:checked + .video-entry-thmb .video-entry-length {
    transform: scale(0);
  }

  #show-description:checked + .video-entry-thmb .thmb-image-container .video-description-overlay {
    opacity: 1;
  }

  .video-entry-thmb {
    position: relative;
    z-index: 11;
    perspective: 1000px;

    .thmb-image-container {
      position: relative;
      top: 0;
      left: 0;
      transition: transform 800ms 100ms $intro-easing;
      transform-style: preserve-3d;
      box-shadow: $medium-shadow;

      .thmb-clip {
        overflow: hidden;
        backface-visibility: hidden;

        .video-entry-thmb-image {
          display: block;
          width: 100%;
          transition: filter 0ms 300ms $intro-easing;
        }
      }

      .video-description-overlay {
        pointer-events: none;
        color: $video-thmb-overlay-textcolor;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: #0000009f;
        padding: 10px;
        overflow: hidden;
        box-sizing: border-box;
        font-size: 1rem;
        opacity: 0;
        transition: opacity 200ms $intro-easing;

        p {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      }
    }

    .video-saved-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background-color: var(--theme-color);
      max-width: 100%;
    }

    .video-entry-length {
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
      transition: transform 200ms $intro-easing;
    }
  }

  .video-entry-info {
    padding: 15px 0 10px 0;
    font-family: $default-font;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    align-items: left;
    z-index: 11;

    .author-thumbnail {
      width: 48px;
      height: 48px;
      margin: 0 10px 0 0;
    }

    .video-info-text {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      width: 100%;

      .video-entry-title {
        text-decoration: none;
        margin: 0;
        font-size: 0.9rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--title-color);
        padding: 0 0 4px 0;
        width: 100%;
        box-sizing: border-box;
      }

      .video-entry-channel {
        text-decoration: none;
        padding: 3px 0 4px 0;
        font-size: 0.8rem;
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--subtitle-color);
      }

      .video-entry-stats {
        color: var(--subtitle-color-light);
        display: flex;
        width: 100%;
        justify-content: space-between;
        flex-direction: row;
        font-size: 0.8rem;
        margin: 5px 0 0 0;
      }
    }
  }

  // @media screen and (max-width: $mobile-width) {
  //   width: calc(100% - 20px);
  //   padding: 10px;

  //   .video-entry-thmb {
  //     width: 100%;
  //     height: 53vw;

  //     &:hover.has-description {
  //       .thmb-image-container {
  //         transform: rotateY(180deg) translateY(0);
  //         .thmb-clip {
  //           .video-entry-thmb-image {
  //             filter: blur(5px);
  //           }
  //         }
  //       }
  //       .video-entry-length {
  //         transform: scale(0);
  //       }
  //     }

  //     .thmb-image-container {
  //       position: relative;
  //       top: 0;
  //       left: 0;
  //       transform: translateY(0);

  //       .thmb-clip {
  //         height: 53vw;

  //         .video-entry-thmb-image {
  //           top: 0;
  //           transform: translateY(0px);
  //         }
  //       }
  //     }
  //   }
  // }
}
</style>
