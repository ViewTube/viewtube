<template>
  <div class="home">
    <vue-headful v-bind:title="channel.author + ' - ViewTube'" />
    <Spinner class="centered" v-if="loading"></Spinner>
    <div class="channel-banner" v-if="!loading">
      <div class="channel-banner-image">
        <clazy-load class="banner-image-loader" v-bind:src="channel.authorBanners[0].url">
          <img class="banner-image" v-bind:src="channel.authorBanners[0].url" />
          <img
            class="banner-placeholder"
            slot="placeholder"
            v-bind:src="channel.authorBanners[3].url"
          />
        </clazy-load>
      </div>
    </div>
    <div class="channel-information" v-if="!loading"></div>
    <div class="channel-videos-container">
      <VideoEntry
        v-for="video in channel.latestVideos"
        v-bind:key="video.videoId"
        v-bind:video="video"
      ></VideoEntry>
    </div>
  </div>
</template>

<script>
import Commons from '@/commons.js'
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
      channel: [],
      loading: true
    }
  },
  mounted: function () {
    fetch(`${Commons.apiUrl}channels/${this.$route.params.id}`)
      .then(response => response.json())
      .then(data => {
        this.channel = data
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
