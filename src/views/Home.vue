<template>
  <div class="home">
    <Spinner class="centered" v-if="loading"></Spinner>
    <div class="home-videos-container">
      <VideoEntry v-for="video in videos" v-bind:key="video.videoId" v-bind:video="video"></VideoEntry>
    </div>
  </div>
</template>

<script>
import Constants from '@/const.js'
import VideoEntry from '@/components/VideoEntry'
import Spinner from '@/components/Spinner'

export default {
  name: 'home',
  components: {
    VideoEntry,
    Spinner
  },
  data: function () {
    return {
      videos: [],
      loading: true
    }
  },
  mounted: function () {
    fetch(`${Constants.apiUrl}top`)
      .then(response => response.json())
      .then(data => {
        this.videos = data
        this.loading = false
      })
      .catch((error) => {
        return error
      })
  }
}
</script>

<style lang="scss">
.home {
  .home-videos-container {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    z-index: 10;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;

    @media screen and (max-width: $mobile-width) {
      flex-direction: column;
    }
  }
}
</style>
