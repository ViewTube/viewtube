<template>
  <div class="subscriptions">
    <div class="subscription-videos-container">
      <VideoEntry v-for="video in videos" :key="video.videoId" :video="video"></VideoEntry>
    </div>
    <BottomNavigation />
  </div>
</template>

<script>
import Commons from '@/plugins/commons.js'
import VideoEntry from '@/components/list/VideoEntry'
import BottomNavigation from '@/components/BottomNavigation'

export default {
  name: 'home',
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
  },
  methods: {
    loadData(data) {
      this.videos = data.subscriptions
      this.loading = false
    }
  },
  beforeRouteEnter(to, from, next) {
    const jwt = VueCookie.get('jwt')
    fetch(`${Commons.getOwnApiUrl()}subscriptions/getSubscriptionFeed.php`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${jwt}`
      }
    })
      .then(response => response.json())
      .then(data => {
        next(vm => vm.loadData(data))
      })
      .catch(error => {
        console.error(error)
      })
  },
  beforeRouteUpdate(to, from, next) {
    const jwt = this.$cookies.get('jwt')
    fetch(`${Commons.getOwnApiUrl()}subscriptions/getSubscriptionFeed.php`, {
      cache: 'force-cache',
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${jwt}`
      }
    })
      .then(response => response.json())
      .then(data => {
        this.loadData(data)
        next()
      })
      .catch(error => {
        console.error(error)
        next()
      })
  }
}
</script>

<style lang="scss">
.subscriptions {
  overflow-y: scroll;
  margin-top: $header-height;

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
