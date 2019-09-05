<template>
  <div
    class="video-player"
    v-on:touchend.stop="onPlayerTouchEnd"
    v-on:touchstart.stop="onPlayerTouchStart"
    v-on:mousemove="onPlayerMouseMove"
    v-on:mouseleave="onPlayerMouseLeave"
    v-on:click="onPlayerClicked"
  >
    <Spinner class="video-spinner" v-if="videoElement.buffering"></Spinner>
    <div class="video-controls-overlay" :class="{ visible: playerOverlay.visible }">
      <div class="top-control-overlay"></div>
      <div class="center-control-overlay">
        <div class="play-btn-container" v-on:click="onPlayerClicked">
          <div class="play-btn" :class="{ playing: videoElement.playing }"></div>
        </div>
      </div>
      <div class="bottom-control-overlay" :class="{ hidden: playerOverlay.thumbnailVisible }">
        <div class="seekbar">
          <div class="seekbar-clickable"></div>
          <div class="seekbar-background"></div>
          <div
            class="seekbar-loading-progress"
            :style="{ width: `${videoElement.loadingPercentage}%` }"
          ></div>
          <div
            class="seekbar-playback-progress"
            :style="{ width: `${videoElement.progressPercentage}%` }"
          ></div>
        </div>
        <div class="bottom-controls"></div>
      </div>
    </div>
    <div
      class="video-thumbnail-overlay"
      :style="{ backgroundImage: `url(${video.videoThumbnails[0].url})` }"
      :class="{ hidden: !playerOverlay.thumbnailVisible }"
    ></div>
    <video
      class="video"
      :src="video.formatStreams[0].url"
      v-on:waiting="onVideoBuffering"
      v-on:canplay="onVideoCanplay"
      v-on:playing="onVideoPlaying"
      v-on:pause="onVideoPaused"
      :style="{ cursor: playerOverlay.visible === true ? 'auto' : 'none' }"
      ref="video"
    ></video>
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
      playerOverlay: {
        visible: false,
        timeout: undefined,
        updateInterval: undefined,
        thumbnailVisible: true
      },
      videoElement: {
        positionSaveInterval: undefined,
        buffering: true,
        playing: false,
        progressPercentage: 0,
        loadingPercentage: 0,
        firstTimeBuffering: true
      }
    }
  },
  watch: {
    playerOverlayVisible: function (newValue) {
      if (newValue) {
        this.playerOverlay.updateInterval = setInterval(() =>
          this.updateVideoOverlay(), 100)
      } else {
        clearInterval(this.playerOverlay.updateInterval)
      }
    }
  },
  computed: {
    videoLength () {
      if (this.$refs.video !== undefined) {
        return this.$refs.video.duration
      }
      return 0
    },
    playerOverlayVisible () {
      return this.playerOverlay.visible
    },
    savedPosition: {
      get () {
        if (this.video !== undefined) {
          return parseInt(localStorage.getItem(`savedVideoPositionId${this.video.videoId}`)) || 0
        }
        return 0
      },
      set (value) {
        if (this.video !== undefined) {
          return localStorage.setItem(`savedVideoPositionId${this.video.videoId}`, value)
        }
      }
    }
  },
  mounted: function () {

  },
  methods: {
    updateVideoOverlay: function () {
      let video = this.$refs.video
      this.videoElement.progressPercentage = (video.currentTime / this.videoLength) * 100
      this.videoElement.loadingPercentage = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100
      console.log((video.buffered.end(video.buffered.length - 1) / video.duration) * 100)
    },
    onVideoPlaying: function () {
      this.videoElement.playing = true
      this.videoElement.positionSaveInterval = setInterval(() =>
        this.saveVideoPosition(), 5000)
    },
    onVideoPaused: function () {
      this.videoElement.playing = false
      this.saveVideoPosition()
      clearInterval(this.videoElement.positionSaveInterval)
    },
    onVideoCanplay: function () {
      if (this.videoElement.firstTimeBuffering) {
        this.$refs.video.currentTime = this.savedPosition
        this.videoElement.firstTimeBuffering = false
      }
      this.videoElement.buffering = false
    },
    onVideoBuffering: function () {
      this.videoElement.buffering = true
    },
    onLoaded: function () {
      this.loading = false
    },
    onPlayerClicked: function () {
      this.playerOverlay.thumbnailVisible = false
      if (this.videoElement.playing) {
        this.$refs.video.pause()
      } else {
        this.$refs.video.play()
      }
    },
    onPlayerTouchStart: function (e) {
    },
    onPlayerTouchEnd: function (e) {
      if (this.playerOverlay.visible) {
        this.hidePlayerOverlay()
      } else {
        this.showPlayerOverlay()
      }
      e.stopPropagation()
      e.preventDefault()
    },
    onPlayerMouseMove: function (e) {
      this.showPlayerOverlay()
    },
    onPlayerMouseLeave: function (e) {
      this.hidePlayerOverlay()
    },
    saveVideoPosition: function () {
      let video = this.$refs.video
      if (video !== undefined) {
        this.savedPosition = video.currentTime
      }
    },
    showPlayerOverlay: function () {
      this.playerOverlay.visible = true
      if (this.playerOverlay.timeout) {
        clearTimeout(this.playerOverlay.timeout)
      }
      this.playerOverlay.timeout = setTimeout(() => {
        this.playerOverlay.visible = false
      }, 3000)
    },
    hidePlayerOverlay: function () {
      if (this.playerOverlay.timeout) {
        clearTimeout(this.playerOverlay.timeout)
      }
      this.playerOverlay.visible = false
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

        &:hover{
          .seekbar-background, .seekbar-loading-progress, .seekbar-playback-progress {
            height: $video-seekbar-line-height + 5px;
          }
        }

        @mixin seekbar-part {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 100%;
          transition: height 100ms linear;
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
