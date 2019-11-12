<template>
  <div class="home" v-scroll="handleScroll">
    <vue-headful
      title="Home - ViewTube"
      :description="commons.description"
      image="https://viewtube.eu/images/icon-256.png"
      lang="en"
    />
    <SectionTitle
      :title="'Subscriptions'"
      :gradient="true"
      v-if="userAuthenticated"
      :link="'subscriptions'"
    />
    <div class="home-videos-container small" v-if="userAuthenticated">
      <VideoEntry v-for="video in subscriptions.subscriptions" :key="video.videoId" :video="video"></VideoEntry>
    </div>
    <SectionTitle :title="'Popular videos'" :gradient="!userAuthenticated" />
    <div class="home-videos-container small">
      <VideoEntry v-for="video in videos" :key="video.videoId" :video="video"></VideoEntry>
    </div>
    <BottomNavigation />
  </div>
</template>

<script>
import Commons from '@/commons.js'
import VideoEntry from '@/components/list/VideoEntry'
import BottomNavigation from '@/components/BottomNavigation'
import SectionTitle from '@/components/SectionTitle.vue'
import UserStore from '@/store/user.js'

export default {
  name: 'home',
  components: {
    VideoEntry,
    BottomNavigation,
    SectionTitle
  },
  data: function () {
    return {
      videos: [],
      subscriptions: [],
      loading: true,
      commons: Commons,
      loginState: UserStore.state
    }
  },
  mounted: function () {
  },
  computed: {
    userAuthenticated() {
      return Boolean(this.loginState.username)
    }
  },
  methods: {
    loadData: function (data) {
      this.videos = data
      if (this.userAuthenticated) {
        this.getSubscriptions()
      } else {
        this.$Progress.finish()
      }
    },
    getSubscriptions() {
      let jwt = this.$cookie.get('jwt')
      let me = this
      fetch(`${Commons.getOwnApiUrl()}subscriptions/getSubscriptionFeed.php?limit=4`, {
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
          me.subscriptions = data
          me.loading = false
          this.$Progress.finish()
        })
        .catch(error => {
          console.error(error)
        })
    },
    showMoreVideos() {

    },
    handleScroll(e) {
      this.$emit('scroll', e)
    }
  },
  beforeRouteEnter: function (to, from, next) {
    fetch(`${Commons.apiUrl}popular`, {
      cache: 'force-cache',
      method: 'GET'
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
    fetch(`${Commons.apiUrl}popular`, {
      cache: 'force-cache',
      method: 'GET'
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
.home {
  overflow-y: scroll;

  .home-videos-container {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    z-index: 10;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    background-color: $bgcolor-main;

    @media screen and (max-width: $mobile-width) {
      flex-direction: column;
    }
  }
}
</style>
