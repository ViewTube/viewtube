<template>
  <div class="subscriptions">
    <vue-headful
      title="Subscriptions - ViewTube"
      :description="commons.description"
      image="https://viewtube.eu/images/icon-256.png"
      lang="en"
    />
    <div
      class="subscription-videos-container"
      ref="scrollContainer"
      @scroll="this.$emit('scrolled')"
    >
      <VideoEntry v-for="video in videos" :key="video.videoId" :video="video"></VideoEntry>
    </div>
  </div>
</template>

<script>
import Commons from '@/commons.js'
import VideoEntry from '@/components/list/VideoEntry'
import Spinner from '@/components/Spinner'
import Mapper from '@/services/mapper.js'

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
  },
  methods: {
    loadData: function (data) {
      let mappedData = Mapper.mapSubscriptionVideoFeed(data)
      this.videos = mappedData
      this.loading = false
      this.$Progress.finish()
      // Just don't ask, it doesn't work without it
      setTimeout(() => {
        this.$refs.scrollContainer.scrollTop = this.$route.meta.scrollHeight
      }, 0)
    }
  },
  beforeRouteEnter: function (to, from, next) {
    let jwt = window.sessionStorage.getItem('jwt');
    fetch(`${Commons.ownApiUrl}subscriptions/getSubscriptionFeed.php`, {
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
        next(vm => vm.loadData(data))
      })
      .catch(error => {
        console.error(error)
        next(vm => vm.$Progress.fail())
      })
  },
  beforeRouteUpdate: function (to, from, next) {
    this.$Progress.start()
    let jwt = window.sessionStorage.getItem('jwt');
    fetch(`${Commons.apiUrl}top`, {
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
  .subscriptions-videos-container {
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
