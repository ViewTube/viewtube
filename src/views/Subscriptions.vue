<template>
  <div class="subscriptions" @scroll="$emit('scroll', $event)">
    <vue-headful
      title="Subscriptions - ViewTube"
      :description="commons.description"
      image="https://viewtube.eu/images/icon-256.png"
      lang="en"
    />
    <div class="subscription-videos-container">
      <VideoEntry v-for="video in videos" :key="video.videoId" :video="video"></VideoEntry>
    </div>
    <BottomNavigation />
  </div>
</template>

<script>
import Commons from '@/commons.js'
import VideoEntry from '@/components/list/VideoEntry'
import BottomNavigation from '@/components/BottomNavigation'
import VueCookie from 'vue-cookie'

export default {
  name: 'home',
  components: {
    VideoEntry,
    BottomNavigation
  },
  data: function () {
    return {
      videos: [],
      loading: true,
      commons: Commons
    }
  },
  mounted: function () {
  },
  methods: {
    loadData: function (data) {
      this.videos = data.subscriptions
      this.loading = false
      this.$Progress.finish()
    }
  },
  beforeRouteEnter: function (to, from, next) {
    let jwt = VueCookie.get('jwt')
    fetch(`${Commons.getOwnApiUrl()}subscriptions/getSubscriptionFeed.php`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${jwt}`
      }
    })
      .then(response => response.json())
      .then(data => {
        next(vm => vm.loadData(data))
      })
      .catch(error => {
        console.error(error)
        next(vm => vm.$Progress.fail())
      })
  },
  beforeRouteUpdate: function (to, from, next) {
    this.$Progress.start()
    let jwt = this.$cookie.get('jwt')
    fetch(`${Commons.getOwnApiUrl()}subscriptions/getSubscriptionFeed.php`, {
      cache: 'force-cache',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${jwt}`
      }
    })
      .then(response => response.json())
      .then(data => {
        this.loadData(data)
        next()
      })
      .catch(error => {
        console.error(error)
        this.$Progress.fail()
        next()
      })
  }
}
</script>

<style lang="scss">
.subscriptions {
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
