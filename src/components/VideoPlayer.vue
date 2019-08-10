<template>
  <div class="video-player">
    <video
      class="video"
      v-bind:src="video.formatStreams[0].url"
      v-on:mousemove="onPlayerMouseMove"
      v-on:mouseleave="onPlayerMouseLeave"
    ></video>
    <Spinner v-if="videoBuffering"></Spinner>
    <transition name="fade">
      <div class="video-controls-overlay" v-if="playerOverlayVisible">
        asd
      </div>
    </transition>
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
      videoBuffering: true,
      loading: true,
      playerOverlayVisible: false,
      playerOverlayTimeout: undefined
    }
  },
  methods: {
    onLoaded: function () {
      this.loading = false
    },
    onPlayerMouseMove: function (e) {
      this.playerOverlayTimeout = setTimeout(
        this.playerOverlayVisible = true
        , 500)
    },
    onPlayerMouseLeave: function (e) {
      clearTimeout(this.playerOverlayTimeout)
      this.playerOverlayVisible = false
    }
  }
}
</script>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms $intro-easing;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave {
  opacity: 1;
}

.video-player {
  width: 100%;
  height: $player-height;
  max-height: calc(100vh - 169px);
  background-color: #000;
  display: flex;
  position: relative;

  .video-controls-overlay {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    opacity: 0;

    &.visible {
      opacity: 1;
    }
  }
}
</style>
