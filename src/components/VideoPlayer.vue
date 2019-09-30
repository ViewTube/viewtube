<template>
  <div
    class="video-player"
    @touchend.stop="onPlayerTouchEnd"
    @touchstart.stop="onPlayerTouchStart"
    @mousemove="onPlayerMouseMove"
    @mouseleave="onPlayerMouseLeave"
    @click="onPlayerClicked"
    ref="videoPlayer"
  >
    <video
      class="video"
      :src="video.formatStreams[0].url"
      @waiting="onVideoBuffering"
      @canplay="onVideoCanplay"
      @playing="onVideoPlaying"
      @pause="onVideoPaused"
      @volumechange="onVolumeChange"
      @timeupdate="onPlaybackProgress"
      @progress="onLoadingProgress"
      :style="{ opacity: playerOverlay.thumbnailVisible ? 0 : 1 }"
      ref="video"
    ></video>
    <Spinner class="video-spinner" v-if="videoElement.buffering" />
    <div
      class="video-controls-overlay"
      :class="{ visible: playerOverlay.visible }"
      :style="{ cursor: playerOverlay.visible ? 'auto' : 'none'}"
    >
      <div class="top-control-overlay"></div>
      <div class="center-control-overlay">
        <div class="play-btn-container" @touchend="onPlayBtnTouchEnd">
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
          <div class="seekbar-circle" :style="{ left: `${videoElement.progressPercentage}%` }"></div>
        </div>
        <div class="bottom-controls">
          <div class="left-bottom-controls">
            <PauseIcon v-if="videoElement.playing" />
            <PlayIcon v-if="!videoElement.playing" />
            <VolumeHighIcon v-if="volumeCategory == 3" />
            <VolumeMediumIcon v-if="volumeCategory == 2" />
            <VolumeLowIcon v-if="volumeCategory == 1" />
            <VolumeOffIcon v-if="volumeCategory == 0" />
            <div class="video-time-progress">
              <span
                class="video-time-current-progress"
              >{{ commons.getTimestampFromSeconds(videoElement.progress) }} / {{ commons.getTimestampFromSeconds(videoLength) }}</span>
            </div>
          </div>
          <div class="right-bottom-controls">
            <FullscreenIcon v-if="!fullscreen" @click="onEnterFullscreen" />
            <FullscreenExitIcon v-if="fullscreen" @click="onLeaveFullscreen" />
          </div>
        </div>
      </div>
    </div>
    <div
      class="video-thumbnail-overlay"
      :style="{ backgroundImage: `url(${video.videoThumbnails[0].url})` }"
      :class="{ hidden: !playerOverlay.thumbnailVisible }"
    ></div>
  </div>
</template>

<script>
import Spinner from '@/components/Spinner'
import SavedPosition from '@/store/videoProgress'
import PauseIcon from 'icons/Pause'
import PlayIcon from 'icons/Play'
import VolumeHighIcon from 'icons/VolumeHigh'
import VolumeMediumIcon from 'icons/VolumeMedium'
import VolumeLowIcon from 'icons/VolumeLow'
import VolumeOffIcon from 'icons/VolumeOff'
import FullscreenIcon from 'icons/Fullscreen'
import FullscreenExitIcon from 'icons/FullscreenExit'
import Commons from '@/commons.js'

export default {
  name: 'videoplayer',
  components: {
    Spinner,
    PauseIcon,
    PlayIcon,
    VolumeHighIcon,
    VolumeMediumIcon,
    VolumeLowIcon,
    VolumeOffIcon,
    FullscreenIcon,
    FullscreenExitIcon
  },
  props: {
    video: Object
  },
  data: function () {
    return {
      loading: true,
      fullscreen: false,
      commons: Commons,
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
        progress: 0,
        progressPercentage: 0,
        loadingPercentage: 0,
        firstTimeBuffering: true,
        volume: 1
      }
    }
  },
  watch: {
  },
  computed: {
    videoLength() {
      if (this.video !== undefined) {
        return this.video.lengthSeconds
      }
      return 0
    },
    playerOverlayVisible() {
      return this.playerOverlay.visible
    },
    volumeCategory() {
      if (this.videoElement.volume >= 1) {
        return 3
      } else if (this.videoElement.volume < 1 && this.videoElement.volume >= 0.5) {
        return 2
      } else if (this.videoElement.volume < 0.5 && this.videoElement.volume > 0) {
        return 1
      } else if (this.videoElement.volume <= 0) {
        return 0
      }
      return 0
    }
  },
  mounted: function () { },
  methods: {
    // Video events
    onPlaybackProgress: function () {
      let videoRef = this.$refs.video
      if (videoRef) {
        this.videoElement.progressPercentage = (videoRef.currentTime / this.videoLength) * 100
        this.videoElement.progress = videoRef.currentTime
      }
    },
    onLoadingProgress: function () {
      let videoRef = this.$refs.video
      if (videoRef) {
        let videoBufferedMaxTimeRange = videoRef.buffered.length - 1
        if (videoBufferedMaxTimeRange > 0 && videoBufferedMaxTimeRange !== undefined) {
          let loadingPercentage = (videoRef.buffered.end(videoRef.buffered.length - 1) / videoRef.duration) * 100
          this.videoElement.loadingPercentage = loadingPercentage
        }
      }
    },
    onVolumeChange: function () {
      if (this.$refs.video) {
        this.videoElement.volume = this.$refs.video.volume
      }
    },
    onVideoPlaying: function () {
      this.playerOverlay.thumbnailVisible = false
      this.videoElement.playing = true
      this.videoElement.positionSaveInterval = setInterval(
        () => this.saveVideoPosition(),
        5000
      )
    },
    onVideoPaused: function () {
      this.videoElement.playing = false
      this.saveVideoPosition()
      clearInterval(this.videoElement.positionSaveInterval)
    },
    onVideoCanplay: function () {
      if (this.videoElement.firstTimeBuffering) {
        this.$refs.video.currentTime = SavedPosition.getSavedPosition(
          this.video.videoId
        )
        this.videoElement.firstTimeBuffering = false
        this.$refs.video.play()
      }
      this.videoElement.buffering = false
    },
    onVideoBuffering: function () {
      this.videoElement.buffering = true
    },
    onLoaded: function () {
      this.loading = false
    },
    // Interaction events
    onEnterFullscreen: function (e) {
      var elem = this.$refs.videoPlayer
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen()
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        elem.webkitRequestFullscreen()
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen()
      }
      e.stopPropagation()
      this.fullscreen = true
    },
    onLeaveFullscreen: function (e) {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
      e.stopPropagation()
      this.fullscreen = false
    },
    onPlayBtnTouchEnd: function (e) {
      if (this.videoElement.playing) {
        this.$refs.video.pause()
      } else {
        this.$refs.video.play()
      }
      // e.stopPropagation()
    },
    onPlayerClicked: function () {
      this.playerOverlay.thumbnailVisible = false
      if (this.videoElement.playing) {
        this.$refs.video.pause()
      } else {
        this.$refs.video.play()
      }
    },
    onPlayerTouchStart: function (e) { },
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
        SavedPosition.setSavedPosition(video.currentTime, this.video.videoId)
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
    transition: opacity 1200ms $intro-easing;
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
    transition: opacity 1200ms $intro-easing;

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
    pointer-events: none;

    .top-control-overlay {
      position: relative;

      &:before {
        content: "";
        position: absolute;
        width: 100%;
        height: $bottom-overlay-height;
        top: 0;
        left: 0;
        z-index: -1;
        background-image: $video-player-gradient;
      }
    }

    .center-control-overlay {
      display: flex;

      .play-btn-container {
        pointer-events: all;
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
      pointer-events: all;
      height: $bottom-overlay-height;
      width: 100%;
      display: flex;
      flex-direction: column;
      z-index: 141;
      transition: opacity 300ms $intro-easing;
      position: relative;

      &:before {
        content: "";
        position: absolute;
        width: 100%;
        height: $bottom-overlay-height;
        top: 0;
        left: 0;
        z-index: -1;
        background-image: $video-player-gradient;
        transform: rotate(180deg);
      }

      .seekbar {
        height: $video-seekbar-height;
        width: calc(100% - 20px);
        margin: 0 auto;
        position: relative;
        z-index: 142;
        display: flex;
        box-sizing: border-box;

        &:hover {
          .seekbar-background,
          .seekbar-loading-progress,
          .seekbar-playback-progress {
            height: $video-seekbar-line-height + 4px;
          }

          .seekbar-circle {
            transform: translate(-50%, 2.5px) scale(1);
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

        .seekbar-circle {
          width: 15px;
          height: 15px;
          background-color: $theme-color;
          border-radius: 50%;
          position: relative;
          transform: translate(-50%, 2.5px) scale(0);
          transition: transform 100ms linear;
          z-index: 147;
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
        $bottom-controls-height: $bottom-overlay-height - $video-seekbar-height;
        width: calc(100% - 20px);
        margin: 0 auto;
        height: $bottom-controls-height - 5px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        box-sizing: border-box;

        .left-bottom-controls,
        .right-bottom-controls {
          display: flex;
          flex-direction: row;

          .video-time-progress {
            height: 100%;
            display: flex;
            margin: 0 0 0 10px;

            .video-time-current-progress {
              margin: auto;
              font-family: $default-font;
              font-size: 1.1rem;
            }
          }

          .material-design-icon {
            width: $bottom-controls-height;
            height: $bottom-controls-height;
            cursor: pointer;

            svg {
              height: 30px !important;
              width: 30px !important;
              margin: auto;
              bottom: 0 !important;
              position: initial !important;
            }
          }
        }
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
