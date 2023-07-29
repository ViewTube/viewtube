<template>
  <div
    id="video-player"
    ref="videoPlayerRef"
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
        ref="videoRef"
        class="video"
        :style="{
          opacity: playerOverlay.thumbnailVisible ? 0 : 1
        }"
        @waiting="onVideoBuffering"
        @canplay="onVideoCanplay"
        @playing="onVideoPlaying"
        @pause="onVideoPaused"
        @ended="onVideoEnded"
        @volumechange="onVolumeChange"
        @timeupdate="onPlaybackProgress"
        @progress="onLoadingProgress"
        @loadedmetadata="onLoadedMetadata"
        @ratechange="onSpeedChanged"
      />
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
          <VTIcon
            v-if="embedded || mini"
            v-tippy="'Open in full player'"
            name="mdi:open-in-new"
            class="tooltip"
            :title="null"
            @click.prevent.stop="onOpenInPlayer"
            @mouseup.prevent.stop="onOpenInPlayerMouseUp"
            @touchend.prevent.stop="onOpenInPlayer"
          />
          <!-- <VTIcon name="mdi:arrow-expand"
            v-if="!videoElement.zoomed"
            v-tippy="'Zoom video'"
            class="tooltip"
            :title="null"
            @click="onVideoExpand"
            @mouseup="onVideoExpandMouseUp"
            @touchend.stop="onVideoExpand"
          />
          <VTIcon name="mdi:arrow-collapse"
            v-if="videoElement.zoomed"
            v-tippy="'Revert zoom'"
            class="tooltip"
            :title="null"
            @click="onVideoCollapse"
            @mouseup="onVideoCollapseMouseUp"
            @touchend.stop="onVideoCollapse"
          />-->
          <VTIcon
            v-if="mini"
            v-tippy="'Close'"
            name="mdi:close"
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
          @touchend.prevent.stop="onPlayBtnTouchEnd"
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
            @click.prevent.stop="onSeekbarClick"
          />
          <SponsorBlockSegments
            v-if="settingsStore.sponsorblockEnabled && sponsorBlockSegments"
            :segments="sponsorBlockSegments"
          />
          <div v-if="!settingsStore.chapters || !chapters" class="seekbar-background" />
          <div v-if="settingsStore.chapters && chapters" class="seekbar-background-chapters">
            <div
              v-for="(chapter, index) in chapters"
              :key="index"
              class="seekbar-background-chapter"
              :style="{
                left: `${chapter.startPercentage}%`,
                width: `calc(${chapter.endPercentage - chapter.startPercentage}% - 3px)`
              }"
              :class="{
                hovering:
                  seekbar.hoverPercentage > chapter.startPercentage &&
                  seekbar.hoverPercentage < chapter.endPercentage
              }"
            />
          </div>
          <div
            v-if="!settingsStore.chapters || !chapters"
            class="seekbar-loading-progress"
            :style="{
              width: `${videoElement.loadingPercentage}%`
            }"
          />
          <div
            v-if="settingsStore.chapters && chapters"
            class="seekbar-loading-progress-chapters"
            :style="{
              'clip-path': `polygon(
                0 -100%,
                ${videoElement.loadingPercentage}% -100%,
                ${videoElement.loadingPercentage}% 200%,
                0 200%)`
            }"
          >
            <div
              v-for="(chapter, index) in chapters"
              :key="index"
              class="seekbar-loading-progress-chapter"
              :style="{
                left: `${chapter.startPercentage}%`,
                width: `calc(${chapter.endPercentage - chapter.startPercentage}% - 3px)`
              }"
              :class="{
                hovering:
                  seekbar.hoverPercentage > chapter.startPercentage &&
                  seekbar.hoverPercentage < chapter.endPercentage
              }"
            />
          </div>
          <div
            v-if="!settingsStore.chapters || !chapters"
            class="seekbar-playback-progress"
            :style="{
              width: `${videoElement.progressPercentage}%`
            }"
          />
          <div
            v-if="settingsStore.chapters && chapters"
            class="seekbar-playback-progress-chapters"
            :style="{
              'clip-path': `polygon(
                0 -100%,
                ${videoElement.progressPercentage}% -100%,
                ${videoElement.progressPercentage}% 200%,
                0 200%)`
            }"
          >
            <div
              v-for="(chapter, index) in chapters"
              :key="index"
              class="seekbar-playback-progress-chapter"
              :style="{
                left: `${chapter.startPercentage}%`,
                width: `calc(${chapter.endPercentage - chapter.startPercentage}% - 3px)`
              }"
              :class="{
                hovering:
                  seekbar.hoverPercentage > chapter.startPercentage &&
                  seekbar.hoverPercentage < chapter.endPercentage
              }"
            />
          </div>
          <div
            class="seekbar-circle"
            :style="{
              left: `${videoElement.progressPercentage}%`
            }"
          />
          <!-- <SeekbarPreview
            ref="seekbarHoverPreviewRef"
            :storyboards="video.storyboards"
            :time="seekbar.hoverTimeStamp"
            :video-id="video.videoId"
            :style="{
              transform: `translate3d(${seekHoverAdjustedLeft(seekbarHoverPreviewRef)},0,0)`
            }"
          /> -->
          <div
            ref="seekbarHoverTimestampRef"
            class="seekbar-hover-timestamp"
            :style="{
              left: seekHoverAdjustedLeft(seekbarHoverTimestampRef)
            }"
          >
            {{ seekbar.hoverTime }}
          </div>
          <span
            v-if="settingsStore.chapters && getChapterForPercentage(seekbar.hoverPercentage)"
            ref="chapterTitleRef"
            class="chapter-title"
            :style="{
              left: `${hoverAdjustedLeft(
                chapterTitleRef,
                getChapterForPercentage(seekbar.hoverPercentage).startPercentage
              )}`
            }"
            >{{ getChapterForPercentage(seekbar.hoverPercentage).title }}</span
          >
        </div>
        <div class="bottom-controls">
          <div class="left-bottom-controls">
            <VTIcon v-if="videoElement.playing" name="mdi:pause" />
            <VTIcon v-if="!videoElement.playing" name="mdi:play" />
            <VolumeControl
              v-model.number="videoElement.playerVolume"
              v-tippy="'Change volume'"
              class="tooltip"
              :player-overlay-visible="playerOverlayVisible"
              @mouseup.prevent.stop="onVolumeInteraction"
              @click.prevent.stop="onVolumeInteraction"
            />
            <div class="video-time-progress">
              <span class="video-time-current-progress"
                >{{ $formatting.getTimestampFromSeconds(videoElement.progress) }}
                /
                {{ $formatting.getTimestampFromSeconds(videoElement.duration) }}</span
              >
            </div>
          </div>
          <div class="right-bottom-controls">
            <VideoPlayerSettings
              ref="videoPlayerSettingsRef"
              :video-quality-list="videoQualityList"
              :audio-quality-list="audioQualityList"
              :selected-video-quality="selectedVideoQuality"
              :selected-audio-quality="selectedAudioQuality"
              :rendered-video-quality="renderedVideoQuality"
              :fullscreen="fullscreen"
              @videoqualityselect="onChangeVideoQuality"
              @audioqualityselect="onChangeAudioQuality"
              @speedchange="onChangeSpeed"
              @loopchange="onChangeLoop"
              @autoadjustchange="onAutoAdjustChange"
              @refreshrecommended="onRefreshRecommendedQuality"
            />
            <VTIcon
              v-if="!fullscreen"
              v-tippy="'Enter Fullscreen'"
              name="mdi:fullscreen"
              class="tooltip"
              @click.prevent.stop="onEnterFullscreen"
              @mouseup.prevent.stop="onEnterFullscreenMouseUp"
              @touchend.prevent="onEnterFullscreen"
            />
            <VTIcon
              v-if="fullscreen"
              v-tippy="'Leave fullscreen'"
              name="mdi:fullscreen-exit"
              class="tooltip"
              @click.prevent.stop="onLeaveFullscreen"
              @mouseup.prevent.stop="onLeaveFullscreenMouseUp"
              @touchend.prevent="onLeaveFullscreen"
            />
          </div>
        </div>
      </div>
    </div>
    <SkipButton
      :visible="skipButton.visible"
      :category="skipButton.skipCategory"
      :click-fn="skipButton.clickFn"
    />
    <VideoPlayerAnimations :animations="animations" />
    <div
      v-if="video.thumbnails && video.thumbnails.length > 0"
      class="video-thumbnail-overlay"
      :style="{
        backgroundImage: `url(${imgProxyUrl + video.thumbnails[0].url})`
      }"
      :class="{ hidden: !playerOverlay.thumbnailVisible, autoplay: settingsStore.autoplay }"
    />
  </div>
</template>

<script lang="ts">
import { videoPlayerSetup } from '@/utils/videoplayer/helpers';
import VideoPlayerAnimations from '@/components/videoplayer/VideoPlayerAnimations.vue';
import SkipButton from '@/components/buttons/SkipButton.vue';
import Spinner from '@/components/Spinner.vue';
import VolumeControl from '@/components/videoplayer/VolumeControl.vue';
import VideoPlayerSettings from '@/components/videoplayer/VideoPlayerSettings.vue';
// import SeekbarPreview from '@/components/videoplayer/SeekbarPreview.vue';
import SponsorBlockSegments from '@/components/videoplayer/SponsorblockSegments.vue';
import { PropType } from 'vue';
import { ApiDto } from '~/../shared';

export default defineComponent({
  name: 'VideoPlayer',
  components: {
    Spinner,
    SkipButton,
    VolumeControl,
    VideoPlayerSettings,
    // SeekbarPreview,
    VideoPlayerAnimations,
    SponsorBlockSegments
  },
  props: {
    video: {
      type: Object as PropType<ApiDto<'VTVideoInfoDto'>>,
      required: true
    },
    embedded: Boolean,
    mini: Boolean,
    autoplay: Boolean,
    initialVideoTime: {
      type: Number,
      required: false,
      default() {
        return 0;
      }
    }
  },
  emits: ['close'],
  setup(props, { emit, expose }) {
    const videoPlayer = videoPlayerSetup(props, emit);
    expose({
      setVideoTime: videoPlayer.setVideoTime,
      play: () => videoPlayer.videoRef.value.play()
    });
    return {
      ...videoPlayer
    };
  }
});
</script>

<style lang="scss">
button.pictureInPictureToggleButton {
  border-radius: 15px !important;
}

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
    position: absolute !important;
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

    &.autoplay {
      transition: opacity 200ms $intro-easing;
    }

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

      .top-control-overlay {
        transform: translate3d(0, -100%, 0);
      }

      .bottom-control-overlay {
        transform: translate3d(0, 100%, 0);
      }
    }

    &.visible {
      opacity: 1;
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
      transition: transform 300ms $intro-easing;

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
          width: 60px;
          height: 60px;
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
      transition: opacity 300ms $intro-easing, transform 300ms $intro-easing;
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

          .chapter-title {
            opacity: 1;
          }

          .seekbar-background-chapters,
          .seekbar-loading-progress-chapters,
          .seekbar-playback-progress-chapters {
            .seekbar-background-chapter,
            .seekbar-loading-progress-chapter,
            .seekbar-playback-progress-chapter {
              &.hovering {
                transform: scale(1, 3);
              }
            }
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
          bottom: 45px;
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
        .seekbar-background-chapters {
          @include seekbar-part;
          height: $video-seekbar-line-height;
          z-index: 142;

          .seekbar-background-chapter {
            position: absolute;
            background-color: var(--line-color);
            height: 100%;
            transition: transform 100ms linear;
          }
        }

        .seekbar-loading-progress {
          @include seekbar-part;
          height: $video-seekbar-line-height;
          background-color: var(--line-accent-color);
          z-index: 143;
        }

        .seekbar-loading-progress-chapters {
          @include seekbar-part;
          height: $video-seekbar-line-height;
          z-index: 143;

          .seekbar-loading-progress-chapter {
            position: absolute;
            background-color: var(--line-accent-color);
            height: 100%;
            transition: transform 100ms linear;
          }
        }

        .chapter-title {
          position: absolute;
          bottom: 15px;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 300ms $intro-easing, left 300ms $intro-easing;
          text-shadow: 0 0 4px #000;
        }

        .seekbar-playback-progress {
          @include seekbar-part;
          height: $video-seekbar-line-height;
          background-color: var(--theme-color);
          z-index: 144;
        }

        .seekbar-playback-progress-chapters {
          @include seekbar-part;
          height: $video-seekbar-line-height;
          z-index: 144;

          .seekbar-playback-progress-chapter {
            position: absolute;
            background-color: var(--theme-color);
            height: 100%;
            transition: transform 100ms linear;
          }
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
  }
}
</style>
