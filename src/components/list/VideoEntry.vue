<template>
  <div class="video-entry">
    <div class="video-entry-background"></div>
    <router-link
      class="video-entry-thmb"
      :to="{path: '/watch?v=' + video.videoId}"
      :data-tippy-content="videoProgressTooltip"
      :class="{ tooltip: videoProgressPercentage > 0 }"
    >
      <div class="thmb-image-container">
        <img
          class="video-entry-thmb-image"
          v-lazy="video.videoThumbnails[4].url"
          :alt="`${video.title}`"
        />
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
  mounted () {
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
    background-color: #34363b;
    z-index: 10;
    transition-duration: 300ms;
    transition-timing-function: $intro-easing;
    transition-property: box-shadow;
  }

  .video-entry-thmb {
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

      .video-entry-thmb-image {
        width: 100%;
      }

      .video-description-overlay {
        pointer-events: none;
        color: $video-thmb-overlay-textcolor;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: #000000c0;
        padding: 25px 5px 5px 5px;
        overflow: hidden;
        box-sizing: border-box;
        font-size: 0.9rem;
        opacity: 0;
        transition: opacity 300ms $intro-easing;

        p {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      }
    }

    &:hover {
      .thmb-image-container {
        .video-description-overlay {
          opacity: 1;
          transition: opacity 300ms 500ms $intro-easing;
        }
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
      height: 53vw;;

      .thmb-image-container {
        position: relative;
        top: 0;
        left: 0;
        transform: translateY(0);

        .video-entry-thmb-image {
          top: 0;
          transform: translateY(0px);
        }
      }
    }
  }
}
</style>
