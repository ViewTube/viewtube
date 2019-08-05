<template>
  <div class="video-entry">
    <router-link class="video-entry-thmb" :to="{path: '/watch?v=' + video.videoId}">
      <img class="video-entry-thmb-image" alt="Thumbnail" v-bind:src="video.videoThumbnails[2].url" />
      <span class="video-entry-length">{{ getTimestampFromSeconds(video.lengthSeconds) }}</span>
    </router-link>
    <div class="video-entry-info">
      <router-link
        class="video-entry-title"
        :to="{path: '/watch?v=' + video.videoId}"
        v-bind:title="video.title"
      >{{ video.title }}</router-link>
      <router-link
        class="video-entry-channel"
        :to="{path: '/channel/' + video.authorId}"
        v-bind:title="video.author"
      >{{ video.author }}</router-link>
      <div class="video-entry-stats">
        <p class="video-entry-views">{{ video.viewCount.toLocaleString() }}</p>
        <p class="video-entry-timestamp">{{ video.publishedText }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoEntry',
  props: {
    video: Object
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

      function toDoubleDigit (i) {
        if (i < 10) {
          i = '0' + i
        }
        return i
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

    .video-entry-thmb-image {
      position: relative;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      width: 100%;
      transition: opacity 200ms $intro-easing;
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

      .video-entry-thmb-image {
        top: 0;
        transform: translateY(0px);
      }
    }
  }
}
</style>
