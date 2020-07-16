<template>
  <div class="subscriptions">
    <div class="subscription-videos-container">
      <VideoEntry
        v-for="video in videos"
        :key="video.videoId"
        :video="video"
      />
    </div>
    <BottomNavigation />
  </div>
</template>

<script>
import Commons from '@/plugins/commons.js'
import VideoEntry from '@/components/list/VideoEntry'
import BottomNavigation from '@/components/BottomNavigation'

export default {
  name: 'Home',
  components: {
    VideoEntry,
    BottomNavigation
  },
  data: () => ({
    videos: [],
    loading: true,
    commons: Commons
  }),
  mounted() {
    this.$axios.get(`${Commons.getOwnApiUrl()}user/subscriptions/videos`, {
      withCredentials: true
    })
      .then((response) => {
        console.log(response.data)
        this.videos = response.data
        this.loading = false
      })
      .catch((error) => {
        console.error(error)
      })
  }
}
</script>

<style lang="scss">
.subscriptions {
  overflow-y: scroll;
  overflow-x: hidden;
  padding-top: $header-height;
  height: calc(100% - #{$header-height});

  .subscription-videos-container {
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
