<template>
  <div
    class="video-player"
    @mousemove="onPlayerMouseMove"
    @mouseleave="onPlayerMouseLeave"
    @mouseup="onPlayerMouseUp"
    @touchend="onPlayerTouchEnd"
    @touchstart="onPlayerTouchStart"
    @touchmove="onPlayerTouchMove"
    @click="onPlayerClick"
    @fullscreenchange="onFullscreenChange"
    @webkitfullscreenchange="onFullscreenChange"
    @mozfullscreenchange="onFullscreenChange"
    @msfullscreenchange="onFullscreenChange"
    ref="videoPlayer"
    :style="{
      cursor: playerOverlay.visible ? 'auto' : 'none',
      'height': `calc(100vw * ${videoElement.aspectRatio})`
    }"
    :class="{ fullscreen: fullscreen }"
  >
    <div
      class="video-element-container"
      :class="{ zoom: videoElement.zoomed }"
      :style="{
        'height': `calc(100vw * ${videoElement.aspectRatio})`,
        'max-height': videoElement.zoomed ? `calc(100vw * ${videoElement.aspectRatio})` : ''
      }"
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
        @loadedmetadata="onLoadedMetadata"
        :style="{
          opacity: playerOverlay.thumbnailVisible ? 0 : 1
        }"
        ref="video"
      ></video>
      <VideoEndscreen
        :videoId="video.videoId"
        :videoProgress="videoElement.progress"
        :videoElement="$refs.video"
      />
    </div>

    <Spinner class="video-spinner" v-if="videoElement.buffering" />
    <div
      class="video-controls-overlay"
      :class="{ visible: playerOverlay.visible }"
      :style="{ cursor: playerOverlay.visible ? 'auto' : 'none'}"
    >
      <div class="top-control-overlay" :class="{ hidden: playerOverlay.thumbnailVisible }">
        <div class="left-top-controls"></div>
        <div class="right-top-controls">
          <ArrowExpandIcon
            v-if="!videoElement.zoomed"
            @click="onVideoExpand"
            @mouseup="onVideoExpandMouseUp"
            @touchend.stop="onVideoExpand"
          />
          <ArrowCollapseIcon
            v-if="videoElement.zoomed"
            @click="onVideoCollapse"
            @mouseup="onVideoCollapseMouseUp"
            @touchend.stop="onVideoCollapse"
          />
        </div>
      </div>
      <div class="center-control-overlay">
        <div class="left-action-container"></div>
        <div class="play-btn-container" @touchend="onPlayBtnTouchEnd" @click="onPlayBtnClick">
          <div class="play-btn" :class="{ playing: videoElement.playing }"></div>
        </div>
        <div class="right-action-container"></div>
      </div>
      <div class="bottom-control-overlay" :class="{ hidden: playerOverlay.thumbnailVisible }">
        <div class="seekbar" :class="{ dragging: seekbar.seeking }">
          <div
            class="seekbar-clickable"
            @mousedown.prevent="onSeekbarMouseDown"
            @mouseleave.prevent="onSeekbarMouseLeave"
            @mouseenter.prevent="onSeekbarMouseEnter"
            @touchstart.prevent="onSeekbarTouchStart"
            @mousemove.prevent="onSeekbarMouseMove"
            @touchmove.prevent="onSeekbarTouchMove"
            @click.prevent="onSeekBarClick"
          ></div>
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
          <div
            class="seekbar-hover-timestamp"
            ref="seekbarHoverTimestamp"
            :style="{ left: seekHoverAdjustedLeft }"
          >{{ seekbar.hoverTime }}</div>
        </div>
        <div class="bottom-controls">
          <div class="left-bottom-controls">
            <PauseIcon v-if="videoElement.playing" />
            <PlayIcon v-if="!videoElement.playing" />
            <VolumeControl
              v-model.number="videoElement.playerVolume"
              @mouseup.stop="onVolumeInteraction"
              @click.stop="onVolumeInteraction"
            />
            <div class="video-time-progress">
              <span
                class="video-time-current-progress"
              >{{ commons.getTimestampFromSeconds(videoElement.progress) }} / {{ commons.getTimestampFromSeconds(videoLength) }}</span>
            </div>
          </div>
          <div class="right-bottom-controls">
            <FullscreenIcon
              v-if="!fullscreen"
              @click="onEnterFullscreen"
              @mouseup="onEnterFullscreenMouseUp"
              @touchend.stop="onEnterFullscreen"
            />
            <FullscreenExitIcon
              v-if="fullscreen"
              @click="onLeaveFullscreen"
              @mouseup="onLeaveFullscreenMouseUp"
              @touchend.stop="onLeaveFullscreen"
            />
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
import FullscreenIcon from 'icons/Fullscreen'
import FullscreenExitIcon from 'icons/FullscreenExit'
import ArrowExpandIcon from 'icons/ArrowExpand'
import ArrowCollapseIcon from 'icons/ArrowCollapse'
import Commons from '@/commons.js'
import VideoEndscreen from '@/components/videoplayer/VideoEndscreen'
import VolumeControl from '@/components/videoplayer/VolumeControl'

export default {
  name: 'videoplayer',
  components: {
    Spinner,
    PauseIcon,
    PlayIcon,
    FullscreenIcon,
    FullscreenExitIcon,
    VideoEndscreen,
    ArrowExpandIcon,
    ArrowCollapseIcon,
    VolumeControl
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
        aspectRatio: 16 / 9,
        playerVolume: 1,
        zoomed: false
      },
      seekbar: {
        seeking: false,
        seekPercentage: 0,
        hoverPercentage: 0,
        hoverTime: '00:00'
      }
    }
  },
  watch: {
    videoVolume (newValue) {
      if (newValue <= 1 && newValue >= 0 && this.$refs.video) {
        this.$refs.video.volume = newValue
      }
    }
  },
  computed: {
    videoVolume () {
      return this.videoElement.playerVolume
    },
    videoLength () {
      if (this.video !== undefined) {
        return this.video.lengthSeconds
      }
      return 0
    },
    playerOverlayVisible () {
      return this.playerOverlay.visible
    },
    seekHoverAdjustedLeft: function () {
      let percentage = this.seekbar.hoverPercentage
      let leftPx = 0
      if (this.$refs.seekbarHoverTimestamp) {
        let elWidth = this.$refs.seekbarHoverTimestamp.offsetWidth
        let pageWidth = Commons.getPageWidth()
        leftPx = ((pageWidth - 27.5) / 100) * percentage - ((elWidth / 2) - 12)

        if (leftPx < 10) {
          leftPx = 10
        }
        if (leftPx > pageWidth - elWidth - 17) {
          leftPx = pageWidth - elWidth - 17
        }
      }

      return `${leftPx}px`
    }
  },
  mounted: function () {
    document.addEventListener('keydown', this.onWindowKeyDown)
    console.log(this.videoElement.aspectRatio)
  },
  beforeDestroy: function () {
    document.removeEventListener('keydown', this.onWindowKeyDown)
  },
  methods: {
    // Window events
    onWindowKeyDown: function (e) {
      if (this.$refs.video) {
        if (e.key === ' ') {
          this.toggleVideoPlayback()
          e.preventDefault()
        }
      }
    },

    // Video events
    onLoadedMetadata: function (e) {
      this.videoElement.aspectRatio = e.target.videoHeight / e.target.videoWidth
    },
    onPlaybackProgress: function () {
      let videoRef = this.$refs.video
      if (videoRef && !this.seekbar.seeking) {
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
        this.videoElement.playerVolume = this.$refs.video.volume
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
        // this.$refs.video.play()
      }
      this.videoElement.buffering = false
    },
    onVideoBuffering: function () {
      this.videoElement.buffering = true
    },
    onLoaded: function () {
      this.loading = false
    },
    // Seekbar events
    onSeekbarTouchStart: function (e) {
      this.seekbar.seeking = true
      let touchX = e.touches[0].clientX
      this.seekbar.seekPercentage = this.calculateSeekPercentage(touchX)
      this.matchSeekProgressPercentage()
      this.seekbar.hoverPercentage = this.calculateSeekPercentage(touchX)
      this.seekbar.hoverTime = Commons.getTimestampFromSeconds((this.$refs.video.duration / 100) * this.seekbar.hoverPercentage)
      e.stopPropagation()
    },
    onSeekbarMouseMove: function (e) {
      this.seekbar.hoverPercentage = this.calculateSeekPercentage(e.pageX)
      this.seekbar.hoverTime = Commons.getTimestampFromSeconds((this.$refs.video.duration / 100) * this.seekbar.hoverPercentage)
    },
    onSeekbarTouchMove: function (e) {
      let touchX = e.touches[0].clientX
      this.seekbar.hoverPercentage = this.calculateSeekPercentage(touchX)
      this.seekbar.hoverTime = Commons.getTimestampFromSeconds((this.$refs.video.duration / 100) * this.seekbar.hoverPercentage)
    },
    onPlayerTouchMove: function (e) {
      if (this.seekbar.seeking) {
        let touchX = e.touches[0].clientX
        this.seekbar.seekPercentage = this.calculateSeekPercentage(touchX)
        this.matchSeekProgressPercentage()
      }
      e.stopPropagation()
    },
    onSeekbarMouseDown: function (e) {
      this.seekbar.seeking = true
      e.stopPropagation()
    },
    onPlayerClick: function (e) {
      this.toggleVideoPlayback()
      e.stopPropagation()
      e.preventDefault()
    },
    onPlayerMouseUp: function (e) {
      if (this.seekbar.seeking) {
        this.seekbar.seeking = false
        this.matchSeekProgressPercentage(true)
      } else {
        // this.toggleVideoPlayback()
      }
      e.stopPropagation()
      e.preventDefault()
    },
    onSeekbarMouseLeave: function (e) {
      e.stopPropagation()
    },
    onSeekbarMouseEnter: function (e) {
      e.stopPropagation()
    },
    onSeekBarClick: function (e) {
      this.seekbar.seekPercentage = this.calculateSeekPercentage(e.pageX)
      this.matchSeekProgressPercentage(true)
      e.stopPropagation()
    },
    matchSeekProgressPercentage: function (adjustVideo) {
      this.videoElement.progressPercentage = this.seekbar.seekPercentage
      if (adjustVideo) {
        let currentTime = (this.$refs.video.duration / 100) * this.seekbar.seekPercentage
        this.$refs.video.currentTime = currentTime
      }
    },
    calculateSeekPercentage: function (pageX) {
      let seekPercentage = ((pageX - 10) / (Commons.getPageWidth() - 27.5)) * 100
      if (seekPercentage > 0 && seekPercentage < 100) {
        return seekPercentage
      } else if (seekPercentage > 100) {
        return 100
      } else {
        return 0
      }
    },
    isMouseOufOfBoundary: function (pageX, pageY) {
      return (pageX > Commons.getPageWidth() || pageX < 0 || pageY < 0)
    },
    // Interaction events
    onVolumeInteraction: function (e) {

    },
    onVideoExpand: function (e) {
      this.videoElement.zoomed = true
      e.stopPropagation()
      e.preventDefault()
    },
    onVideoExpandMouseUp: function (e) {
      e.stopPropagation()
      e.preventDefault()
    },
    onVideoCollapse: function (e) {
      this.videoElement.zoomed = false
      e.stopPropagation()
      e.preventDefault()
    },
    onVideoCollapseMouseUp: function (e) {
      e.stopPropagation()
      e.preventDefault()
    },
    onEnterFullscreen: function (e) {
      var elem = this.$refs.videoPlayer
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen()
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen()
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen()
      }
      this.fullscreen = true
      e.stopPropagation()
      e.preventDefault()
    },
    onEnterFullscreenMouseUp: function (e) {
      e.preventDefault()
      e.stopPropagation()
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
      this.fullscreen = false
      e.stopPropagation()
      e.preventDefault()
    },
    onFullscreenChange: function (e) {
      if (document.fullscreenElement) {
        this.fullscreen = true
      } else {
        this.fullscreen = false
      }
    },
    onLeaveFullscreenMouseUp: function (e) {
      e.preventDefault()
      e.stopPropagation()
    },
    onPlayBtnTouchEnd: function (e) {
      this.toggleVideoPlayback()
      e.stopPropagation()
      e.preventDefault()
    },
    onPlayBtnClick: function (e) {
      this.toggleVideoPlayback()
      e.stopPropagation()
      e.preventDefault()
    },
    toggleVideoPlayback: function () {
      if (!this.seekbar.seeking) {
        this.playerOverlay.thumbnailVisible = false
        if (this.videoElement.playing) {
          this.$refs.video.pause()
        } else {
          this.$refs.video.play()
        }
      }
    },
    onPlayerTouchStart: function (e) { },
    onPlayerTouchEnd: function (e) {
      if (this.seekbar.seeking) {
        this.seekbar.seeking = false
        this.matchSeekProgressPercentage(true)
      } else {
        if (this.playerOverlay.visible) {
          this.hidePlayerOverlay()
        } else {
          this.showPlayerOverlay(true)
        }
      }
      e.stopPropagation()
      e.preventDefault()
    },
    onPlayerMouseMove: function (e) {
      this.showPlayerOverlay()
      if (this.seekbar.seeking) {
        this.seekbar.seekPercentage = this.calculateSeekPercentage(e.pageX)
        this.matchSeekProgressPercentage()
        if (this.isMouseOufOfBoundary(e.pageX, e.pageY)) {
          this.seekbar.seeking = false
        }
      }
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
    showPlayerOverlay: function (noTimeout) {
      this.playerOverlay.visible = true
      if (this.playerOverlay.timeout) {
        clearTimeout(this.playerOverlay.timeout)
      }
      if (!noTimeout) {
        this.playerOverlay.timeout = setTimeout(() => {
          this.playerOverlay.visible = false
        }, 3000)
      }
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
  background-color: #000;
  display: flex;
  position: relative;
  overflow: hidden;
  max-height: calc(100vh - 170px);

  &.fullscreen {
    .video-element-container {
      max-height: 100vh;

      &.zoom {
        .video {
          // width: 100vw !important;
        }
      }
    }
  }

  .video-element-container {
    height: $player-height;
    position: relative;
    transform: translate(-50%, -50%);
    max-height: calc(100vh - 170px);
    top: 50%;
    left: 50%;
    margin: 0;
    transition: max-height 300ms $dynamic-easing, height 300ms $dynamic-easing;

    .video {
      height: 100%;
      z-index: 100;
      transition: opacity 1200ms $intro-easing;
    }
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
      width: 100%;
      margin: 0 auto;
      height: $bottom-overlay-height - 5px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      box-sizing: border-box;

      .left-top-controls {
      }

      .right-top-controls {
        .material-design-icon {
          width: 40px;
          height: 40px;
          cursor: pointer;
          pointer-events: all;
        }
      }

      &.hidden {
        opacity: 0;
      }

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

        &:hover,
        &.dragging {
          .seekbar-background,
          .seekbar-loading-progress,
          .seekbar-playback-progress {
            height: $video-seekbar-line-height + 4px;
          }

          .seekbar-circle {
            transform: translate(-50%, 2.5px) scale(1);
          }

          .seekbar-hover-timestamp {
            opacity: 1;
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
          pointer-events: none;
          cursor: pointer;
        }

        .seekbar-hover-timestamp {
          position: relative;
          bottom: 30px;
          background-color: $video-thmb-overlay-bgcolor;
          padding: 4px 6px;
          height: 25px;
          line-height: 17px;
          opacity: 0;
          transform: translateX(-50%);
          box-sizing: border-box;
          border-radius: 3px;
          pointer-events: none;
          transition: opacity 300ms $intro-easing;
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
