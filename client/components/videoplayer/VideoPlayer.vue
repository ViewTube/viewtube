<template>
  <div
    ref="videoPlayer"
    class="video-player"
    :style="{
      cursor: playerOverlay.visible ? 'auto' : 'none',
      height: `calc(100vw * ${videoElement.aspectRatio})`
    }"
    :class="{
      fullscreen: fullscreen,
      embedded: embedded || mini
    }"
    @mousemove.stop="onPlayerMouseMove"
    @mouseleave.prevent.stop="onPlayerMouseLeave"
    @mouseup.prevent.stop="onPlayerMouseUp"
    @touchend.prevent.stop="onPlayerTouchEnd"
    @touchstart.stop="onPlayerTouchStart"
    @touchmove.stop="onPlayerTouchMove"
    @click.prevent.stop="onPlayerClick"
    @dblclick.prevent.stop="onSwitchFullscreen"
    @fullscreenchange.prevent.stop="onFullscreenChange"
    @webkitfullscreenchange.prevent.stop="onFullscreenChange"
    @mozfullscreenchange.prevent.stop="onFullscreenChange"
    @msfullscreenchange.prevent.stop="onFullscreenChange"
  >
    <div class="video-element-container" :class="{ zoom: videoElement.zoomed }">
      <video
        ref="video"
        class="video"
        :src="highestVideoQuality"
        :style="{
          opacity: playerOverlay.thumbnailVisible ? 0 : 1
        }"
        @waiting="onVideoBuffering"
        @canplay="onVideoCanplay"
        @playing="onVideoPlaying"
        @pause="onVideoPaused"
        @volumechange="onVolumeChange"
        @timeupdate="onPlaybackProgress"
        @progress="onLoadingProgress"
        @loadedmetadata="onLoadedMetadata"
      />
      <!-- <VideoEndscreen
        :videoId="video.videoId"
        :videoProgress="videoElement.progress"
        :videoElement="$refs.video"
      />-->
    </div>

    <Spinner v-if="videoElement.buffering" class="video-spinner" />
    <div
      class="video-controls-overlay"
      :class="{ visible: playerOverlayVisible }"
      :style="{
        cursor: playerOverlay.visible ? 'auto' : 'none'
      }"
    >
      <div class="top-control-overlay" :class="{ hidden: playerOverlay.thumbnailVisible }">
        <div class="left-top-controls">
          <h1 v-if="fullscreen || embedded || mini" class="video-fullscreen-title">
            {{ video.title }}
          </h1>
        </div>
        <div class="right-top-controls">
          <OpenInPlayerIcon
            v-if="embedded || mini"
            v-tippy="'Open in full player'"
            class="tooltip"
            :title="null"
            @click.prevent.stop="onOpenInPlayer"
            @mouseup.prevent.stop="onOpenInPlayerMouseUp"
            @touchend.prevent.stop="onOpenInPlayer"
          />
          <!-- <ArrowExpandIcon
            v-if="!videoElement.zoomed"
            v-tippy="'Zoom video'"
            class="tooltip"
            :title="null"
            @click="onVideoExpand"
            @mouseup="onVideoExpandMouseUp"
            @touchend.stop="onVideoExpand"
          />
          <ArrowCollapseIcon
            v-if="videoElement.zoomed"
            v-tippy="'Revert zoom'"
            class="tooltip"
            :title="null"
            @click="onVideoCollapse"
            @mouseup="onVideoCollapseMouseUp"
            @touchend.stop="onVideoCollapse"
          />-->
          <CloseIcon
            v-if="mini"
            v-tippy="'Close'"
            class="tooltip"
            :title="null"
            @click.prevent.stop="$emit('close')"
            @mouseup.prevent.stop="$emit('close')"
            @touchend.prevent.stop="$emit('close')"
          />
        </div>
      </div>
      <div class="center-control-overlay">
        <div class="left-action-container" />
        <div
          v-if="!videoElement.buffering"
          class="play-btn-container"
          @touchend="onPlayBtnTouchEnd"
          @click="onPlayBtnClick"
        >
          <div class="play-btn" :class="{ playing: videoElement.playing }" />
        </div>
        <div class="right-action-container" />
      </div>
      <div
        v-if="!mini"
        class="bottom-control-overlay"
        :class="{ hidden: playerOverlay.thumbnailVisible }"
      >
        <div class="seekbar" :class="{ dragging: seekbar.seeking }">
          <div
            class="seekbar-clickable"
            @mousedown.prevent.stop="onSeekbarMouseDown"
            @mouseleave.prevent.stop="onSeekbarMouseLeave"
            @mouseenter.prevent.stop="onSeekbarMouseEnter"
            @touchstart.prevent.stop="onSeekbarTouchStart"
            @mousemove.prevent="onSeekbarMouseMove"
            @touchmove.prevent="onSeekbarTouchMove"
            @click.prevent.stop="onSeekBarClick"
          />
          <div class="seekbar-background" />
          <div
            class="seekbar-loading-progress"
            :style="{
              width: `${videoElement.loadingPercentage}%`
            }"
          />
          <div
            class="seekbar-playback-progress"
            :style="{
              width: `${videoElement.progressPercentage}%`
            }"
          />
          <div
            class="seekbar-circle"
            :style="{
              left: `${videoElement.progressPercentage}%`
            }"
          />
          <SeekbarPreview
            ref="seekbarHoverPreview"
            :storyboards="video.storyboards"
            :time="seekbar.hoverTimeStamp"
            :video-id="video.videoId"
            :style="{
              transform: `translate3d(${seekHoverAdjustedLeft(this.$refs.seekbarHoverPreview)},0,0)`
            }"
          />
          <div
            ref="seekbarHoverTimestamp"
            class="seekbar-hover-timestamp"
            :style="{
              left: seekHoverAdjustedLeft(this.$refs.seekbarHoverTimestamp)
            }"
          >
            {{ seekbar.hoverTime }}
          </div>
        </div>
        <div class="bottom-controls">
          <div class="left-bottom-controls">
            <PauseIcon v-if="videoElement.playing" />
            <PlayIcon v-if="!videoElement.playing" />
            <VolumeControl
              v-model.number="videoElement.playerVolume"
              v-tippy="'Change volume'"
              class="tooltip"
              @mouseup.prevent.stop="onVolumeInteraction"
              @click.prevent.stop="onVolumeInteraction"
            />
            <div class="video-time-progress">
              <span class="video-time-current-progress"
                >{{ $formatting.getTimestampFromSeconds(videoElement.progress) }}
                /
                {{ $formatting.getTimestampFromSeconds(videoLength) }}</span
              >
            </div>
          </div>
          <div class="right-bottom-controls">
            <!-- <QualitySelection
              :formatStreams="video.formatStreams"
              :adaptiveFormats="video.adaptiveFormats"
            />-->
            <FullscreenIcon
              v-if="!fullscreen"
              v-tippy="'Enter Fullscreen'"
              class="tooltip"
              @click.prevent.stop="onEnterFullscreen"
              @mouseup.prevent.stop="onEnterFullscreenMouseUp"
              @touchend.prevent.stop="onEnterFullscreen"
            />
            <FullscreenExitIcon
              v-if="fullscreen"
              v-tippy="'Leave fullscreen'"
              class="tooltip"
              @click.prevent.stop="onLeaveFullscreen"
              @mouseup.prevent.stop="onLeaveFullscreenMouseUp"
              @touchend.prevent.stop="onLeaveFullscreen"
            />
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="video.videoThumbnails && video.videoThumbnails.length > 0"
      class="video-thumbnail-overlay"
      :style="{
        backgroundImage: `url(${video.videoThumbnails[0].url})`
      }"
      :class="{ hidden: !playerOverlay.thumbnailVisible }"
    />
  </div>
</template>

<script>
import dashjs from 'dashjs';
import PauseIcon from 'vue-material-design-icons/Pause';
import PlayIcon from 'vue-material-design-icons/Play';
import FullscreenIcon from 'vue-material-design-icons/Fullscreen';
import FullscreenExitIcon from 'vue-material-design-icons/FullscreenExit';
// import ArrowExpandIcon from 'vue-material-design-icons/ArrowExpand';
// import ArrowCollapseIcon from 'vue-material-design-icons/ArrowCollapse';
import OpenInPlayerIcon from 'vue-material-design-icons/OpenInNew';
import CloseIcon from 'vue-material-design-icons/Close';
import Spinner from '@/components/Spinner';
// import VideoEndscreen from '@/components/videoplayer/VideoEndscreen'
import VolumeControl from '@/components/videoplayer/VolumeControl';
// import QualitySelection from '@/components/videoplayer/QualitySelection'
import SeekbarPreview from '@/components/videoplayer/SeekbarPreview';
import Commons from '@/plugins/commons.js';

export default {
  name: 'Videoplayer',
  components: {
    Spinner,
    PauseIcon,
    PlayIcon,
    FullscreenIcon,
    FullscreenExitIcon,
    // VideoEndscreen,
    // ArrowExpandIcon,
    // ArrowCollapseIcon,
    OpenInPlayerIcon,
    CloseIcon,
    VolumeControl,
    // QualitySelection,
    SeekbarPreview
  },
  props: {
    video: {
      required: true,
      type: Object
    },
    embedded: Boolean,
    mini: Boolean,
    autoplay: Boolean
  },
  data: () => ({
    loading: true,
    fullscreen: false,
    commons: Commons,
    dashPlayer: null,
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
      hoverTime: '00:00',
      hoverTimeStamp: 0
    }
  }),
  computed: {
    highestVideoQuality() {
      if (this.video.formatStreams) {
        const video = this.video.formatStreams.find(e => {
          return e.qualityLabel && e.qualityLabel === '720p';
        });
        if (video && video.url) {
          return video.url;
        } else if (this.video.formatStreams.length > 0) {
          return this.video.formatStreams[0].url;
        }
      }
      return '#';
    },
    videoVolume() {
      return this.videoElement.playerVolume;
    },
    videoLength() {
      if (this.video !== undefined) {
        return this.video.lengthSeconds;
      }
      return 0;
    },
    videoUrl() {
      if (this.video !== undefined) {
        return `/watch?v=${this.video.videoId}`;
      }
      return '';
    },
    playerOverlayVisible() {
      return this.playerOverlay.visible || !this.videoElement.playing;
    }
  },
  watch: {
    videoVolume(newValue) {
      if (newValue <= 1 && newValue >= 0 && this.$refs.video) {
        this.$refs.video.volume = newValue;
      }
    }
  },
  mounted() {
    document.addEventListener('keydown', this.onWindowKeyDown);
    // this.loadDashVideo()
  },
  beforeDestroy() {
    this.saveVideoPosition();
    document.removeEventListener('keydown', this.onWindowKeyDown);
  },
  methods: {
    loadDashVideo() {
      if (this.$refs.video) {
        let url = `${Commons.getApiUrlNoVersion()}manifest/dash/id/${
          this.video.videoId
        }?local=true`;
        console.log(url);
        if (this.video.dashUrl) {
          url = `${this.video.dashUrl}?local=true`;
        }
        this.dashPlayer = dashjs.MediaPlayer().create();
        this.dashPlayer.initialize(this.$refs.video, url, false);
        this.dashBitrates = this.dashPlayer.getBitrateInfoListFor('video');
      }
    },
    // Window events
    onWindowKeyDown(e) {
      if (this.$refs.video) {
        if (e.key === ' ') {
          this.toggleVideoPlayback();
          e.preventDefault();
        } else if (e.key === 'ArrowRight') {
          this.$refs.video.currentTime += 5;
        } else if (e.key === 'ArrowLeft') {
          this.$refs.video.currentTime -= 5;
        }
      }
    },

    // Video events
    onLoadedMetadata(e) {
      this.videoElement.aspectRatio = e.target.videoHeight / e.target.videoWidth;
    },
    onPlaybackProgress() {
      const videoRef = this.$refs.video;
      if (videoRef && !this.seekbar.seeking) {
        this.videoElement.progressPercentage = (videoRef.currentTime / this.videoLength) * 100;
        this.videoElement.progress = videoRef.currentTime;
      }
    },
    onLoadingProgress() {
      const videoRef = this.$refs.video;
      if (videoRef) {
        const videoBufferedMaxTimeRange = videoRef.buffered.length - 1;
        if (videoBufferedMaxTimeRange && videoBufferedMaxTimeRange > 0) {
          const loadingPercentage =
            (videoRef.buffered.end(videoRef.buffered.length - 1) / videoRef.duration) * 100;
          this.videoElement.loadingPercentage = loadingPercentage;
        }
      }
    },
    onVolumeChange() {
      if (this.$refs.video) {
        this.videoElement.playerVolume = this.$refs.video.volume;
      }
    },
    onVideoPlaying() {
      this.playerOverlay.thumbnailVisible = false;
      this.videoElement.playing = true;
      this.videoElement.positionSaveInterval = setInterval(() => this.saveVideoPosition(), 5000);
    },
    onVideoPaused() {
      this.videoElement.playing = false;
      this.saveVideoPosition();
      clearInterval(this.videoElement.positionSaveInterval);
    },
    onVideoCanplay() {
      if (this.$refs.video && this.videoElement.firstTimeBuffering) {
        this.$refs.video.currentTime = this.$accessor.videoProgress.getSavedPositionForId(
          this.video.videoId
        );
        this.videoElement.firstTimeBuffering = false;
        if (this.autoplay) {
          this.$refs.video.play();
        }
      }
      this.videoElement.buffering = false;
    },
    onVideoBuffering() {
      this.videoElement.buffering = true;
    },
    onLoaded() {
      this.loading = false;
    },
    // Seekbar events
    onSeekbarTouchStart(e) {
      if (this.playerOverlayVisible) {
        this.seekbar.seeking = true;
        const touchX = e.touches[0].clientX;
        this.seekbar.seekPercentage = this.calculateSeekPercentage(touchX);
        this.matchSeekProgressPercentage();
        this.seekbar.hoverPercentage = this.calculateSeekPercentage(touchX);
        this.seekbar.hoverTime = this.$formatting.getTimestampFromSeconds(
          (this.$refs.video.duration / 100) * this.seekbar.hoverPercentage
        );
        this.seekbar.hoverTimeStamp =
          (this.$refs.video.duration / 100) * this.seekbar.hoverPercentage;
      }
    },
    onSeekbarMouseMove(e) {
      this.seekbar.hoverPercentage = this.calculateSeekPercentage(e.pageX);
      this.seekbar.hoverTime = this.$formatting.getTimestampFromSeconds(
        (this.$refs.video.duration / 100) * this.seekbar.hoverPercentage
      );
      this.seekbar.hoverTimeStamp =
        (this.$refs.video.duration / 100) * this.seekbar.hoverPercentage;
    },
    onSeekbarTouchMove(e) {
      if (this.playerOverlayVisible) {
        const touchX = e.touches[0].clientX;
        this.seekbar.hoverPercentage = this.calculateSeekPercentage(touchX);
        this.seekbar.hoverTime = this.$formatting.getTimestampFromSeconds(
          (this.$refs.video.duration / 100) * this.seekbar.hoverPercentage
        );
        this.seekbar.hoverTimeStamp =
          (this.$refs.video.duration / 100) * this.seekbar.hoverPercentage;
      }
    },
    onPlayerTouchMove(e) {
      if (this.seekbar.seeking) {
        const touchX = e.touches[0].clientX;
        this.seekbar.seekPercentage = this.calculateSeekPercentage(touchX);
        this.matchSeekProgressPercentage();
      }
    },
    onSeekbarMouseDown() {
      this.seekbar.seeking = true;
    },
    onPlayerClick() {
      this.toggleVideoPlayback();
    },
    onPlayerMouseUp() {
      if (this.seekbar.seeking) {
        this.seekbar.seeking = false;
        this.matchSeekProgressPercentage(true);
      } else {
        // this.toggleVideoPlayback()
      }
    },
    onSeekbarMouseLeave() {},
    onSeekbarMouseEnter() {},
    onSeekBarClick(e) {
      this.seekbar.seekPercentage = this.calculateSeekPercentage(e.pageX);
      this.matchSeekProgressPercentage(true);
    },
    matchSeekProgressPercentage(adjustVideo) {
      this.videoElement.progressPercentage = this.seekbar.seekPercentage;
      if (adjustVideo && this.$refs.video) {
        const currentTime = (this.$refs.video.duration / 100) * this.seekbar.seekPercentage;
        this.$refs.video.currentTime = currentTime;
      }
    },
    calculateSeekPercentage(pageX) {
      const seekPercentage = ((pageX - 10) / (Commons.getPageWidth() - 27.5)) * 100;
      if (seekPercentage > 0 && seekPercentage < 100) {
        return seekPercentage;
      } else if (seekPercentage > 100) {
        return 100;
      } else {
        return 0;
      }
    },
    isMouseOufOfBoundary(pageX, pageY) {
      return pageX > Commons.getPageWidth() || pageX < 0 || pageY < 0;
    },
    // Interaction events
    onVolumeInteraction() {},
    onOpenInPlayer() {
      window.open(this.videoUrl, '_blank');
    },
    onOpenInPlayerMouseUp() {},
    onVideoExpand() {
      this.videoElement.zoomed = true;
    },
    onVideoExpandMouseUp() {},
    onVideoCollapse() {
      this.videoElement.zoomed = false;
    },
    onVideoCollapseMouseUp() {},
    onSwitchFullscreen() {
      if (this.fullscreen) {
        this.onLeaveFullscreen();
      } else {
        this.onEnterFullscreen(true);
      }
    },
    onEnterFullscreen(force) {
      if (this.playerOverlayVisible || force === true) {
        const elem = this.$refs.videoPlayer;
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        }
        this.fullscreen = true;
      }
    },
    onEnterFullscreenMouseUp() {},
    onLeaveFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      this.fullscreen = false;
    },
    onFullscreenChange() {
      if (document.fullscreenElement) {
        this.fullscreen = true;
      } else {
        this.fullscreen = false;
      }
    },
    onLeaveFullscreenMouseUp() {},
    onPlayBtnTouchEnd() {
      this.toggleVideoPlayback();
    },
    onPlayBtnClick() {
      this.toggleVideoPlayback();
    },
    toggleVideoPlayback() {
      if (!this.seekbar.seeking) {
        this.playerOverlay.thumbnailVisible = false;
        if (this.videoElement.playing) {
          this.$refs.video.pause();
        } else {
          this.$refs.video.play();
        }
      }
    },
    onPlayerTouchStart() {},
    onPlayerTouchEnd() {
      if (this.seekbar.seeking) {
        this.seekbar.seeking = false;
        this.matchSeekProgressPercentage(true);
      } else if (this.playerOverlay.visible) {
        this.hidePlayerOverlay();
      } else {
        this.showPlayerOverlay(true);
      }
    },
    onPlayerMouseMove(e) {
      this.showPlayerOverlay();
      if (this.seekbar.seeking && this.$refs.video) {
        this.seekbar.seekPercentage = this.calculateSeekPercentage(e.pageX);
        this.seekbar.hoverPercentage = this.calculateSeekPercentage(e.pageX);
        this.seekbar.hoverTime = this.$formatting.getTimestampFromSeconds(
          (this.$refs.video.duration / 100) * this.seekbar.hoverPercentage
        );
        this.seekbar.hoverTimeStamp =
          (this.$refs.video.duration / 100) * this.seekbar.hoverPercentage;
        this.matchSeekProgressPercentage();
        if (this.isMouseOufOfBoundary(e.pageX, e.pageY)) {
          this.seekbar.seeking = false;
        }
      }
    },
    onPlayerMouseLeave() {
      this.hidePlayerOverlay();
    },
    saveVideoPosition() {
      const video = this.$refs.video;
      if (video !== undefined) {
        this.$accessor.videoProgress.addVideoProgress({
          videoId: this.video.videoId,
          value: video.currentTime
        });
        // return this.$localforage.setItem(`savedVideoPositionId${videoId}`, value)
      }
    },
    showPlayerOverlay(noTimeout) {
      this.playerOverlay.visible = true;
      if (this.playerOverlay.timeout) {
        clearTimeout(this.playerOverlay.timeout);
      }
      if (!noTimeout) {
        this.playerOverlay.timeout = setTimeout(() => {
          this.playerOverlay.visible = false;
        }, 3000);
      }
    },
    hidePlayerOverlay() {
      if (this.playerOverlay.timeout) {
        clearTimeout(this.playerOverlay.timeout);
      }
      this.playerOverlay.visible = false;
    },
    seekHoverAdjustedLeft(element) {
      const percentage = this.seekbar.hoverPercentage;
      let leftPx = 0;
      if (element) {
        const elOffsetWidth = element.$el ? element.$el.offsetWidth : 0;
        const elWidth = element.offsetWidth || elOffsetWidth;
        const pageWidth = Commons.getPageWidth();
        leftPx = ((pageWidth - 27.5) / 100) * percentage - (elWidth / 2 - 12);

        if (leftPx < 10) {
          leftPx = 10;
        }
        if (leftPx > pageWidth - elWidth - 17) {
          leftPx = pageWidth - elWidth - 17;
        }
      }

      return `${leftPx}px`;
    }
  }
};
</script>

<style lang="scss">
.video-player {
  width: 100%;
  background-color: #000;
  display: flex;
  position: relative;
  overflow: hidden;
  max-height: calc(100vh - 170px);
  z-index: 12;

  &.embedded {
    height: 100vh !important;
    max-height: 100% !important;
    .video-element-container {
      max-height: 100vh;
      max-width: 100vw;

      .video {
        max-width: 100%;
      }
    }
  }

  &.fullscreen {
    .video-element-container {
      max-height: 100vh;
      max-width: 100vw;

      .video {
        max-width: 100%;
      }

      // &.zoom {
      //   .video {
      //     // width: 100vw !important;
      //   }
      // }
    }
  }

  .video-element-container {
    height: 100%;
    position: relative;
    transform: translate(-50%, -50%);
    max-height: calc(100vh - 170px);
    top: 50%;
    left: 50%;
    margin: 0;
    // transition: max-height 300ms $dynamic-easing, height 300ms $dynamic-easing;

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
    color: #fff;

    &:not(.visible) {
      pointer-events: none !important;
      touch-action: none !important;
    }

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
        .video-fullscreen-title {
          margin: 10px;
          font-size: 1.2rem;
          height: 40px;
          line-height: 40px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          width: 70%;
          position: absolute;
        }
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
        content: '';
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
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      .play-btn-container {
        pointer-events: all;
        margin: auto;
        // filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.16))
        // drop-shadow(0 3px 6px rgba(0, 0, 0, 0.23));

        .play-btn {
          margin: auto;
          width: 100px;
          height: 100px;
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
        content: '';
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
            transform: translateX(-50%) scale(1);
          }

          .seekbar-preview {
            opacity: 1;
          }
        }

        .seekbar-preview {
          &:hover {
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
          background-color: var(--theme-color);
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
          transform: translateX(-50%) scale(0.9);
          box-sizing: border-box;
          border-radius: 3px;
          pointer-events: none;
          transition: opacity 300ms $intro-easing, transform 100ms $intro-easing;
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
          background-color: var(--line-color);
          z-index: 142;
        }
        .seekbar-loading-progress {
          @include seekbar-part;
          height: $video-seekbar-line-height;
          background-color: var(--line-accent-color);
          z-index: 143;
        }
        .seekbar-playback-progress {
          @include seekbar-part;
          height: $video-seekbar-line-height;
          background-color: var(--theme-color);
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
            width: 28px;
            height: 28px;
            margin: 2px 5px;
            cursor: pointer;

            svg {
              height: 28px;
              width: 28px;
              margin: auto;
              bottom: 0 !important;
              position: initial !important;
            }
          }

          .play-icon {
            margin: -1px 10px 0 0;
            height: 32px;

            svg {
              width: 32px;
              height: 32px;
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
