<template>
  <div class="video-entry">
    <div class="video-entry-background"></div>
    <router-link
      class="video-entry-thmb"
      :to="{path: '/watch?v=' + video.videoId}"
      :data-tippy-content="videoProgressTooltip"
      :class="{ tooltip: videoProgressPercentage > 0, 'has-description': video.description }"
    >
      <div class="thmb-image-container">
        <div class="thmb-clip">
          <img
            class="video-entry-thmb-image"
            v-lazy="video.videoThumbnails[4].url"
            :alt="`${video.title}`"
          />
        </div>
        <div class="video-description-overlay" v-if="video.description">
          <p>{{ video.description }}</p>
        </div>
      </div>
      <div class="video-saved-progress" :style="{ width: `${videoProgressPercentage}%` }"></div>
      <span class="video-entry-length">{{ commons.getTimestampFromSeconds(video.lengthSeconds) }}</span>
    </router-link>
    <div class="video-entry-info">
      <router-link
        class="video-entry-title tooltip"
        :to="{path: '/watch?v=' + video.videoId}"
        :data-tippy-content="video.title"
      >{{ video.title }}</router-link>
      <router-link
        class="video-entry-channel tooltip"
        :to="{path: '/channel/' + video.authorId}"
        :data-tippy-content="video.author"
      >{{ video.author }}</router-link>
      <div class="video-entry-stats">
        <p
          class="video-entry-views"
          v-if="video.viewCount !== null"
        >{{ video.viewCount.toLocaleString() }} {{ video.viewCount === 1 ? 'view' : 'views' }}</p>
        <p class="video-entry-timestamp">{{ video.publishedText }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import SavedPosition from '@/store/videoProgress'
import Commons from '@/commons.js'

export default {
  name: 'video-entry',
  props: {
    video: Object
  },
  data: function () {
    return {
      commons: Commons,
      videoProgressPercentage: SavedPosition.getSavedPosition(this.video.videoId) / this.video.lengthSeconds * 100,
      videoProgressTooltip: `${Commons.getTimestampFromSeconds(SavedPosition.getSavedPosition(this.video.videoId))} of ${Commons.getTimestampFromSeconds(this.video.lengthSeconds)}`
    }
  },
  mounted() {
    tippy('.tooltip', {
      duration: 300,
      arrow: false,
      delay: [500, 100],
      touch: 'hold',
      placement: 'bottom'
    })
  },
  methods: {

  }
}
</script>

<style lang="scss">
.video-entry {
  width: 320px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  justify-content: flex-start;
  z-index: 11;
  position: relative;

  .video-entry-background {
    position: absolute;
    height: 175px;
    top: 10px;
    left: 10px;
    width: calc(100% - 20px);
    // background-color: #34363b;
    z-index: 10;
    transition-duration: 300ms;
    transition-timing-function: $intro-easing;
    transition-property: box-shadow;
  }

  .video-entry-thmb {
    width: 100%;
    height: 175px;
    // overflow: hidden;
    position: relative;
    z-index: 11;
    perspective: 1000px;

    .thmb-image-container {
      position: relative;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      transition: transform 800ms 100ms $intro-easing;
      transform-style: preserve-3d;
      box-shadow: $max-shadow;

      .thmb-clip {
        overflow: hidden;
        width: 100%;
        height: 175px;
        backface-visibility: hidden;

        .video-entry-thmb-image {
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
        backface-visibility: hidden;
        transform: rotateY(180deg);

        p {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      }
    }

    &:hover.has-description {
      .thmb-image-container {
        transform: rotateY(180deg) translateY(-50%);
        .thmb-clip {
          .video-entry-thmb-image {
            filter: blur(5px);
          }
        }
      }
      .video-entry-length {
        transform: scale(0);
      }
    }

    .video-saved-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background-color: var(--theme-color);
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
      transition: transform 300ms 200ms $intro-easing;
    }
  }

  .video-entry-info {
    padding: 10px 0 10px 0;
    font-family: $default-font;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: left;
    z-index: 11;

    .video-entry-title {
      text-decoration: none;
      margin: 0;
      font-size: 0.9rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--title-color);
      padding: 6px 0 4px 0;
    }

    .video-entry-channel {
      text-decoration: none;
      padding: 3px 0 4px 0;
      font-size: 0.9rem;
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

  @media screen and (max-width: $mobile-width) {
    width: calc(100% - 20px);
    padding: 10px;

    .video-entry-thmb {
      width: 100%;
      height: 53vw;

      &:hover.has-description {
        .thmb-image-container {
          transform: rotateY(180deg) translateY(0);
          .thmb-clip {
            .video-entry-thmb-image {
              filter: blur(5px);
            }
          }
        }
        .video-entry-length {
          transform: scale(0);
        }
      }

      .thmb-image-container {
        position: relative;
        top: 0;
        left: 0;
        transform: translateY(0);

        .thmb-clip {
          height: 53vw;

          .video-entry-thmb-image {
            top: 0;
            transform: translateY(0px);
          }
        }
      }
    }
  }
}
</style>
