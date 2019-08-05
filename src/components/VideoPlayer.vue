<template>
  <div class="player-viewport">
    <div class="video-thumbnail"></div>
    <div class="play-click-area">
      <vt-play-btn></vt-play-btn>
    </div>
    <div class="video-player-overlay">
      <div class="bottom-overlay">
        <div class="video-seekbar">
          <span class="seekbar-line-progress"></span>
          <span class="seekbar-line-loaded"></span>
          <span class="seekbar-line"></span>
          <div class="seekbar-timestamp"></div>
        </div>
        <div class="video-controls">
          <div class="left-controls-container">
            <div class="video-play-btn">
              <vt-play-btn></vt-play-btn>
            </div>
            <div class="video-audio-btn">
              <i class="material-icons video-audio-btn-icon">volume_up</i>
            </div>
            <div class="audio-bar">
              <span class="audio-bar-volume"></span>
              <span class="audio-bar-background"></span>
            </div>
            <div class="video-time-display">
              <span class="video-time"></span>
            </div>
          </div>
          <div class="right-controls-container">
            <div class="video-settings-btn">
              <i class="material-icons">settings</i>
            </div>
            <div class="video-fullscreen-btn">
              <i class="material-icons video-fullscreen-btn-icon">fullscreen</i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="video-settings-container">
      <div class="video-settings">
        <div class="video-quality-settings">
          <h4>quality</h4>
          <div class="video-quality-selection-combined"></div>
        </div>
      </div>
    </div>
    <video id="video">
      <source class="video-mp4" src="#" type="video/mp4" />
    </video>
    <div class="video-buffer">
      <Spinner></Spinner>
    </div>
  </div>
</template>

<script>
import Spinner from '@/components/Spinner'

export default {
  name: 'videoplayer',
  components: {
    Spinner
  },
  data: function () {
    return {
      videoSources: [],
      loading: true
    }
  },
  mounted: function () {
  }
}
</script>

<style lang="scss">
.video-player-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 200ms $intro-easing;
  user-select: none;
  z-index: 205;

  .bottom-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: $video-seekbar-height;
    pointer-events: visibleStroke;
    background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.692));
    padding: 0 20px;
    box-sizing: border-box;
    z-index: 210;

    .video-seekbar {
      width: 100%;
      padding: 0;
      height: $video-seekbar-line-height;
      display: flex;
      box-sizing: border-box;
      position: relative;
      cursor: pointer;

      .seekbar-timestamp {
        position: absolute;
        left: 0;
        bottom: 15px;
        transform: translateX(-50%);
        border-radius: 3px;
        padding: 3px 5px;
        background-color: $video-thmb-overlay-bgcolor;
        color: $video-thmb-overlay-textcolor;
        font-family: $default-font;
        transition: opacity 200ms $intro-easing;
        opacity: 0;

        &.visible {
          opacity: 1;
        }
      }

      &:hover {
        .seekbar-timestamp {
          opacity: 1;
        }
      }

      @mixin seekbar-line {
        width: 100%;
        height: 5px;
        position: absolute;
        left: 0;
        top: 0;
        transform: translateY(50%);
      }

      .seekbar-line-progress {
        @include seekbar-line;
        background-color: $theme-color;
        z-index: 223;
      }

      .seekbar-line {
        @include seekbar-line;
        background-color: $line-color;
        z-index: 220;
      }

      .seekbar-line-loaded {
        @include seekbar-line;
        background-color: $line-accent-color;
        z-index: 221;
      }
    }

    .video-controls {
      display: flex;
      flex-direction: row;
      height: $video-controls-height;
      justify-content: space-between;

      .left-controls-container {
        display: flex;
        flex-direction: row;

        .video-time-display {
          margin: auto 0;
          color: #fff;
          font-family: $default-font;
        }

        .video-audio-btn {
          height: 40px;
          width: 40px;
          color: #fff;
          display: flex;
          cursor: pointer;

          i {
            margin: auto;
          }

          &:hover ~ .audio-bar {
            width: 50px;
            transition: width 300ms 300ms $intro-easing,
              margin 300ms 300ms $intro-easing;
            margin-right: 15px;
          }
        }

        .audio-bar {
          margin: auto 0;
          display: flex;
          box-sizing: border-box;
          position: relative;
          height: 100%;
          width: 0px;
          overflow: hidden;
          transition: width 300ms 2s $intro-easing,
            margin 300ms 2s $intro-easing;
          margin-right: 5px;
          display: flex;
          cursor: pointer;

          .audio-bar-volume,
          .audio-bar-background {
            width: 100%;
            height: 5px;
            left: 0;
            top: ($video-controls-height / 2) - 2.5px;
            position: absolute;
            margin: auto;
          }

          .audio-bar-volume {
            background-color: $theme-color;

            &.mute {
              background-color: $line-accent-color;
            }
          }

          .audio-bar-background {
            background-color: $line-color;
          }

          &:hover {
            width: 50px;
            margin-right: 15px;
            transition: width 300ms 300ms $intro-easing,
              margin 300ms 300ms $intro-easing;
          }
        }
      }

      .right-controls-container {
        display: flex;
        flex-direction: row;
        position: relative;

        .video-settings-btn,
        .video-fullscreen-btn {
          height: 40px;
          width: 40px;
          color: #fff;
          display: flex;
          cursor: pointer;

          i {
            margin: auto;
          }
        }

        .video-fullscreen-btn {
          i {
            font-size: 1.9rem;
          }
        }
      }
    }
  }

  &.hovering {
    opacity: 1;
  }
}

.video-settings-container {
  position: absolute;
  right: 20px;
  bottom: $video-controls-height + 20px;
  width: 200px;
  background-color: $bgcolor-main;
  transform: translateY(30px);
  transform-origin: 50% 200%;
  opacity: 0;
  transition: transform 300ms $intro-easing, opacity 300ms $intro-easing;
  box-shadow: $medium-shadow;
  border-radius: 2px;
  box-sizing: border-box;
  overflow: hidden;
  pointer-events: none;
  z-index: 205;

  .video-settings {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;

    .video-quality-settings {
      color: $theme-color;
      font-family: $default-font;
      font-size: 1rem;
      text-align: center;

      h4 {
        padding: 10px 0;
      }

      .video-quality-selection-combined {
        display: flex;
        flex-direction: column;

        .quality-combined-entry {
          color: $title-color;
          font-family: $default-font;
          text-decoration: none;
          text-align: left;
          padding: 8px;

          &:hover {
            background-color: $header-bgcolor;
          }

          &:active {
            background-color: $bgcolor-alt;
          }
        }
      }
    }
  }

  &.opened {
    transform: translateY(0px);
    opacity: 1;
    pointer-events: all;
  }
}

.play-click-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  z-index: 305;
  display: flex;
  cursor: pointer;

  .video-play-btn-svg {
    margin: auto;
    height: 50%;
    width: 50%;
    filter: drop-shadow(0 0 20px #000);
    transform: scale(1);
    transition: transform 300ms $outro-easing, opacity 300ms $outro-easing;
  }

  &.zoom-out {
    .video-play-btn-svg {
      transform: scale(0);
      opacity: 0;
    }
  }
}

.video-thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  background-color: $bgcolor-main;
  z-index: 300;
}

.video-play-btn {
  height: $video-seekbar-height - $video-seekbar-line-height;
  width: $video-seekbar-height - $video-seekbar-line-height;
  cursor: pointer;
}

svg.video-play-btn-svg {
  height: 100%;
  fill: #fff;

  path {
    display: none;
  }

  .video-play-btn-paused {
    display: initial;
  }
}
</style>
