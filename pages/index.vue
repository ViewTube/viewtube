<template>
  <div class="home">
    <GradientBackground :color="'theme'" />
    <SectionTitle
      v-if="userAuthenticated"
      :title="'Subscriptions'"
      :link="'subscriptions'"
    />
    <div
      v-if="userAuthenticated"
      class="home-videos-container small"
    >
      <VideoEntry
        v-for="video in subscriptions.subscriptions"
        :key="video.videoId"
        :video="video"
      />
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
      />
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
  name: 'Home',
  components: {
    VideoEntry,
    BottomNavigation,
    SectionTitle,
    GradientBackground
  },
  asyncData({ params }) {
    return Invidious.api.popular()
      .then((response) => {
        return { videos: response.data }
      })
      .catch((error) => {
        console.error(error)
      })
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
  mounted(){
    
  },
  methods: {
    loadData (data) {
      this.videos = data
      if (this.userAuthenticated) {
        this.getSubscriptions()
      }
    },
    getSubscriptions() {
      const jwt = this.$cookies.get('jwt')
      const me = this
      fetch(`${process.env.API_URL}subscriptions/videos?limit=4`, {
        cache: 'force-cache',
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Basic ${jwt}`
        }
      })
        .then(response => response.json())
        .then((data) => {
          me.subscriptions = data
          me.loading = false
        })
        .catch((error) => {
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
