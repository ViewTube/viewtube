<template>
  <div class="video-player">
    <video
      class="video"
      v-bind:src="video.formatStreams[0].url"
      v-on:mousemove="onPlayerMouseMove"
      v-on:mouseleave="onPlayerMouseLeave"
      v-on:waiting="onVideoBuffering"
      v-on:canplay="onVideoCanplay"
      ref="video"
    ></video>
    <Spinner class="video-spinner" v-if="videoBuffering"></Spinner>
    <div class="video-controls-overlay" v-bind:class="{visible: playerOverlayVisible}">
      <div class="bottom-control-overlay">
        <div class="seekbar">
          <div class="seekbar-clickable"></div>
          <div class="seekbar-background"></div>
          <div class="seekbar-loading-progress"></div>
          <div class="seekbar-playback-progress"></div>
        </div>
        <div class="bottom-controls"></div>
      </div>
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
  props: {
    video: Object
  },
  data: function () {
    return {
      loading: true,
      playerOverlayVisible: false,
      playerOverlayTimeout: undefined,
      videoBuffering: true
    }
  },
  methods: {
    onVideoCanplay: function () {
      this.videoBuffering = false
      this.$refs.video.play()
    },
    onVideoBuffering: function () {
      this.videoBuffering = true
    },
    onLoaded: function () {
      this.loading = false
    },
    onPlayerMouseMove: function (e) {
      this.playerOverlayVisible = true
      if (this.playerOverlayTimeout) {
        clearTimeout(this.playerOverlayTimeout)
      }
      this.playerOverlayTimeout = setTimeout(() => {
        this.playerOverlayVisible = false
      }, 3000)
    },
    onPlayerMouseLeave: function (e) {
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

  .video{
    margin: auto;
    height: 100%;
    width: 100%;
  }

  .video-spinner{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .video-controls-overlay {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    opacity: 0;
    pointer-events: none;

    .bottom-control-overlay {
      .seekbar {
        .seekbar-clickable {
        }
        .seekbar-background {
        }
        .seekbar-loading-progress {
        }
        .seekbar-playback-progress {
        }
      }

      .bottom-controls {
      }
    }

    &.visible {
      opacity: 1;
    }
  }
}
</style>
