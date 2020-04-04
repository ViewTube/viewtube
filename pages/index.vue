<template>
  <div class="home">
    <GradientBackground :color="'theme'" />
    <SectionTitle
      :title="'Subscriptions'"
      v-if="userAuthenticated"
      :link="'subscriptions'"
    />
    <div
      class="home-videos-container small"
      v-if="userAuthenticated"
    >
      <VideoEntry
        v-for="video in subscriptions.subscriptions"
        :key="video.videoId"
        :video="video"
      ></VideoEntry>
    </div>
    <SectionTitle
      :title="'Popular videos'"
      :gradient="!userAuthenticated"
    />
    <div class="home-videos-container small">
      <VideoEntry
        v-for="video in videos"
        :key="video.videoId"
        :video="video"
      ></VideoEntry>
    </div>
    <BottomNavigation />
  </div>
</template>

<script>
import Commons from '@/plugins/commons.js'
import VideoEntry from '@/components/list/VideoEntry'
import BottomNavigation from '@/components/BottomNavigation'
import SectionTitle from '@/components/SectionTitle.vue'
import GradientBackground from '@/components/GradientBackground.vue'
import Invidious from '@/plugins/services/invidious'

export default {
  name: 'home',
  components: {
    VideoEntry,
    BottomNavigation,
    SectionTitle,
    GradientBackground
  },
  data: () => ({
    videos: [],
    subscriptions: [],
    loading: true,
    commons: Commons
  }),
  computed: {
    userAuthenticated() {
      return this.$store.getters['user/isLoggedIn']
    }
  },
  asyncData({ params }) {
    return Invidious.api.popular()
      .then(response => {
        return { videos: response.data }
      })
      .catch(error => {
        console.error(error)
      })
  },
  methods: {
    loadData: function (data) {
      this.videos = data
      if (this.userAuthenticated) {
        this.getSubscriptions()
      } else {
      }
    },
    getSubscriptions() {
      const jwt = this.$cookies.get('jwt')
      const me = this
      fetch(`${Commons.getOwnApiUrl()}subscriptions/getSubscriptionFeed.php?limit=4`, {
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
          me.subscriptions = data
          me.loading = false
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
  }
}
</script>

<style lang="scss">
.home {
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100%;

  .home-videos-container {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    z-index: 10;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    background-color: var(--bgcolor-main);

    @media screen and (max-width: $mobile-width) {
      flex-direction: column;
    }
  }
}
</style>
