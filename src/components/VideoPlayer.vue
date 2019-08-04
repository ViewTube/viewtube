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
    <video id="audio"></video>
    <div class="video-buffer">
      <vt-loader></vt-loader>
    </div>
  </div>
</template>

<script>
import Constants from '@/const.js'
import Spinner from '@/components/Spinner'

export default {
  name: 'watch',
  components: {
    Spinner
  },
  data: function () {
    return {
      videoSource: [],
      loading: true
    }
  },
  mounted: function () {
  }
}
</script>

<style lang="scss">
</style>
