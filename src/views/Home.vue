<template>
  <div class="home">
    <vue-headful title="Home - ViewTube" />
    <Spinner class="centered" v-if="loading"></Spinner>
    <div class="home-videos-container">
      <VideoEntry v-for="video in videos" :key="video.videoId" :video="video"></VideoEntry>
    </div>
  </div>
</template>

<script>
import Commons from '@/commons.js'
import VideoEntry from '@/components/list/VideoEntry'
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
    fetch(`${Commons.apiUrl}top`)
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
