<template>
  <div class="video-player">
    <video class="video" v-bind:src="videoSources[0].url"></video>
    <Spinner v-if="loading"></Spinner>
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
    videoSources: Array
  },
  data: function () {
    return {
      videoBuffering: true
    }
  },
  methods: {
    onLoaded: function () {
      this.loading = false
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
}
</style>
