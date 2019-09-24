<template>
  <div class="video-entry" v-on:mouseenter="onMouseEnter">
    <router-link
      class="video-entry-thmb"
      :to="{path: '/watch?v=' + video.videoId}"
      :data-tippy-content="videoProgressTooltip"
      :class="{ tooltip: videoProgressPercentage > 0 }"
    >
      <div class="thmb-image-loader">
        <img
          class="video-entry-thmb-image"
          :src="video.videoThumbnails[3].url"
          :alt="`${video.title} thumbnail`"
        />
      </div>
      <div class="video-saved-progress" :style="{ width: `${videoProgressPercentage}%` }"></div>
      <span class="video-entry-length">{{ getTimestampFromSeconds(video.lengthSeconds) }}</span>
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
        <p class="video-entry-views">{{ video.viewCount.toLocaleString() }}</p>
        <p class="video-entry-timestamp">{{ video.publishedText }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import tippy from 'tippy.js'
import SavedPosition from '@/store/videoProgress'
import Commons from '@/commons.js'

export default {
  name: 'video-entry',
  props: {
    video: Object
  },
  data: function () {
    return {
      videoProgressPercentage: SavedPosition.getSavedPosition(this.video.videoId) / this.video.lengthSeconds * 100,
      videoProgressTooltip: `${this.getTimestampFromSeconds(SavedPosition.getSavedPosition(this.video.videoId))} of ${this.getTimestampFromSeconds(this.video.lengthSeconds)}`
    }
  },
  mounted() {
    tippy('.tooltip', {
      animation: 'shift-away',
      animateFill: false,
      duration: 300,
      arrow: false,
      delay: [500, 100],
      touchHold: true,
      placement: 'bottom'
    })
  },
  methods: {
    getTimestampFromSeconds: seconds => {
      let ms = seconds * 1000
      let date = new Date(ms)
      let timestampHours = toDoubleDigit(date.getHours() - 1)
      let timestampMinutes = toDoubleDigit(date.getMinutes())
      let timestampSeconds = toDoubleDigit(date.getSeconds())
      if (date.getHours() < 1) {
        return `${timestampHours}:${timestampMinutes}:${timestampSeconds}`
      } else {
        return `${timestampMinutes}:${timestampSeconds}`
      }

      function toDoubleDigit(i) {
        if (i < 10) {
          i = '0' + i
        }
        return i
      }
    },
    async onMouseEnter(e) {
      if (!await this.$localforage.getItem(this.video.videoId)) {
        fetch(`${Commons.apiUrl}videos/${this.video.videoId}`, {
          cache: 'force-cache'
        })
          .then(response => response.json())
          .then(data => {
            this.$localforage.setItem(this.video.videoId, data)
          })
          .catch(error => {
            console.error(error)
          })
      } else {
      }
    }
  }
}
</script>

<style lang="scss">
.video-entry {
  width: 220px;
  display: flex;
  flex-direction: column;
  margin: 10px;
  justify-content: flex-start;
  overflow: hidden;
  box-sizing: border-box;

  .video-entry-thmb {
    width: 100%;
    height: 124px;
    overflow: hidden;
    position: relative;

    .thmb-image-loader {
      position: relative;
      top: 50%;
      left: 0;
      transform: translateY(-50%);

      .video-entry-thmb-image {
        width: 100%;
      }
    }

    .video-saved-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background-color: $theme-color;
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
    padding: 0 0 10px 0;
    font-family: $default-font;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: left;

    .video-entry-title {
      text-decoration: none;
      margin: 0;
      font-size: 0.9rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: $title-color;
      padding: 6px 0 4px 0;
    }

    .video-entry-channel {
      text-decoration: none;
      padding: 3px 0 4px 0;
      font-size: 0.8rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: $subtitle-color;
    }

    .video-entry-stats {
      color: $subtitle-color-light;
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
    margin: 10px;

    .video-entry-thmb {
      width: 100%;
      height: unset;

      .thmb-image-loader {
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
