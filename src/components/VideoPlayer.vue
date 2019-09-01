<template>
  <div
    class="video-player"
    v-on:touchend.stop="onPlayerTouchEnd"
    v-on:touchstart.stop="onPlayerTouchStart"
    v-on:mousemove="onPlayerMouseMove"
    v-on:mouseleave="onPlayerMouseLeave"
    v-on:click="onPlayerClicked"
  >
    <video
      class="video"
      :src="video.formatStreams[0].url"
      v-on:waiting="onVideoBuffering"
      v-on:canplay="onVideoCanplay"
      v-on:playing="onVideoPlaying"
      v-on:pause="onVideoPaused"
      :style="{ cursor: playerOverlayVisible === true ? 'auto' : 'none' }"
      ref="video"
    ></video>
    <Spinner class="video-spinner" v-if="videoBuffering"></Spinner>
    <div class="video-controls-overlay" :class="{ visible: playerOverlayVisible }">
      <div class="top-control-overlay"></div>
      <div class="center-control-overlay">
        <div class="play-btn-container" v-on:click="onPlayerClicked">
          <div class="play-btn" :class="{ playing: videoPlaying }"></div>
        </div>
      </div>
      <div class="bottom-control-overlay" :class="{ hidden: thumbnailOverlayVisible }">
        <div class="seekbar">
          <div class="seekbar-clickable"></div>
          <div class="seekbar-background"></div>
          <div class="seekbar-loading-progress" :style="{ width: `${videoLoadingPercentage}%` }"></div>
          <div class="seekbar-playback-progress" :style="{ width: `${videoProgressPercentage}%` }"></div>
        </div>
        <div class="bottom-controls"></div>
      </div>
    </div>
    <div
      class="video-thumbnail-overlay"
      :style="{ backgroundImage: `url(${video.videoThumbnails[0].url})` }"
      :class="{ hidden: !thumbnailOverlayVisible }"
    ></div>
  </div>
</template>

<script>
import Spinner from '@/components/Spinner'

export default {
  name: 'videoplayer',
  components: {
    Spinner
  },
  props: {
    video: Object
  },
  data: function () {
    return {
      loading: true,
      playerOverlayVisible: false,
      playerOverlayTimeout: undefined,
      playerOverlayUpdateInterval: undefined,
      thumbnailOverlayVisible: true,
      videoBuffering: true,
      videoPlaying: false,
      videoProgressPercentage: 0,
      videoLoadingPercentage: 0
    }
  },
  watch: {
    playerOverlayVisible: function (newValue) {
      if (newValue) {
        this.playerOverlayUpdateInterval = setInterval(() =>
          this.updateVideoOverlay()
        , 100)
      } else {
        clearInterval(this.playerOverlayUpdateInterval)
      }
    }
  },
  computed: {
    videoLength: function () {
      if (this.$refs.video !== undefined) {
        return this.$refs.video.duration
      }
      return 0
    }
  },
  methods: {
    updateVideoOverlay: function () {
      let video = this.$refs.video
      this.videoProgressPercentage = (video.currentTime / this.videoLength) * 100
      this.videoLoadingPercentage = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100
    },
    onVideoPlaying: function () {
      this.videoPlaying = true
    },
    onVideoPaused: function () {
      this.videoPlaying = false
    },
    onVideoCanplay: function () {
      this.videoBuffering = false
    },
    onVideoBuffering: function () {
      this.videoBuffering = true
    },
    onLoaded: function () {
      this.loading = false
    },
    onPlayerClicked: function () {
      this.thumbnailOverlayVisible = false
      if (this.videoPlaying) {
        this.$refs.video.pause()
      } else {
        this.$refs.video.play()
      }
    },
    onPlayerTouchStart: function (e) {
    },
    onPlayerTouchEnd: function (e) {
      if (this.playerOverlayVisible) {
        this.hidePlayerOverlay()
      } else {
        this.showPlayerOverlay()
      }
    },
    onPlayerMouseMove: function (e) {
      this.showPlayerOverlay()
    },
    onPlayerMouseLeave: function (e) {
      this.hidePlayerOverlay()
    },
    showPlayerOverlay: function () {
      this.playerOverlayVisible = true
      if (this.playerOverlayTimeout) {
        clearTimeout(this.playerOverlayTimeout)
      }
      this.playerOverlayTimeout = setTimeout(() => {
        this.playerOverlayVisible = false
      }, 3000)
    },
    hidePlayerOverlay: function () {
      if (this.playerOverlayTimeout) {
        clearTimeout(this.playerOverlayTimeout)
      }
      this.playerOverlayVisible = false
    }
  }
}
</script>

<style lang="scss">
.video-player {
  width: 100%;
  height: $player-height;
  max-height: calc(100vh - 169px);
  background-color: #000;
  display: flex;
  position: relative;

  .video {
    margin: auto;
    height: 100%;
    width: 100%;
    z-index: 100;
  }

  .video-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 200;
  }

  .video-thumbnail-overlay {
    position: absolute;
    margin: auto;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-repeat: no-repeat;
    background-size: auto 100%;
    background-position: center;
    z-index: 120;
    pointer-events: none;
    user-select: none;
    opacity: 1;
    transition: opacity 600ms $intro-easing;

    &.hidden {
      opacity: 0;
    }
  }

  .video-controls-overlay {
    position: absolute;
    margin: 0 auto;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: opacity 300ms $intro-easing;
    opacity: 0;
    z-index: 140;

    .top-control-overlay {
    }

    .center-control-overlay {
      display: flex;

      .play-btn-container {
        margin: auto;
        filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.16))
          drop-shadow(0 3px 6px rgba(0, 0, 0, 0.23));

        .play-btn {
          margin: auto;
          width: 14vw;
          height: 14vw;
          background-color: #fff;
          opacity: 1;
          transition: clip-path 300ms $intro-easing, opacity 300ms $intro-easing,
            transform 300ms $intro-easing;
          clip-path: polygon(
            18% 4%,
            18% 4%,
            18% 96%,
            18% 96%,
            18% 4%,
            18% 4%,
            95% 50%,
            95% 50%,
            18% 96%,
            18% 4%
          );

          &.playing {
            opacity: 0.6;
            clip-path: polygon(
              38% 4%,
              18% 4%,
              18% 96%,
              38% 96%,
              38% 4%,
              82% 4%,
              82% 4%,
              82% 96%,
              62% 96%,
              62% 4%
            );
          }
        }
      }
    }

    .bottom-control-overlay {
      height: $bottom-overlay-height;
      width: 100%;
      display: flex;
      flex-direction: column;
      z-index: 141;
      transition: opacity 300ms $intro-easing;

      .seekbar {
        height: $video-seekbar-height;
        width: 95%;
        margin: 0 auto;
        position: relative;
        z-index: 142;
        display: flex;

        @mixin seekbar-part {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 100%;
        }

        .seekbar-clickable {
          @include seekbar-part;
          height: 100%;
          z-index: 146;
          cursor: pointer;
        }
        .seekbar-background {
          @include seekbar-part;
          height: $video-seekbar-line-height;
          background-color: $line-color;
          z-index: 142;
        }
        .seekbar-loading-progress {
          @include seekbar-part;
          height: $video-seekbar-line-height;
          background-color: $line-accent-color;
          z-index: 143;
        }
        .seekbar-playback-progress {
          @include seekbar-part;
          height: $video-seekbar-line-height;
          background-color: $theme-color;
          z-index: 144;
        }
      }

      .bottom-controls {
      }

      &.hidden {
        opacity: 0;
      }
    }

    &.visible {
      opacity: 1;
    }
  }
}
</style>
