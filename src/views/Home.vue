<template>
  <div class="home">
    <vue-headful
      title="Home - ViewTube"
      :description="commons.description"
      image="https://viewtube.eu/images/icon-256.png"
      lang="en"
    />
    <Spinner class="centered" v-if="loading"></Spinner>
    <div class="home-videos-container" ref="scrollContainer" @scroll="this.$emit('scrolled')">
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
      loading: true,
      commons: Commons
    }
  },
  mounted: function () {
    fetch(`${Commons.apiUrl}top`, {
      cache: 'force-cache',
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        this.videos = data
        this.loading = false
        this.$Progress.finish()
        // Just don't ask, it doesn't work without it
        setTimeout(() => {
          this.$refs.scrollContainer.scrollTop = this.$route.meta.scrollHeight
        }, 0)
      })
      .catch((error) => {
        console.error(error)
        this.$Progress.fail()
      })
  },
  beforeRouteLeave(to, from, next) {
    from.meta.scrollHeight = this.$refs.scrollContainer.scrollTop
    next()
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
