<template>
  <div class="home">
    <GradientBackground :color="'theme'" />
    <SectionTitle v-if="userAuthenticated" :title="'Subscriptions'" :link="'subscriptions'" />
    <div v-if="userAuthenticated" class="home-videos-container small">
      <VideoEntry v-for="video in subscriptions" :key="video.videoId" :video="video" />
    </div>
    <SectionTitle :title="'Popular videos'" :gradient="!userAuthenticated" />
    <div class="home-videos-container small">
      <VideoEntry v-for="video in videos" :key="video.videoId" :video="video" />
    </div>
    <BottomNavigation />
  </div>
</template>

<script>
import Commons from '@/plugins/commons.js';
import VideoEntry from '@/components/list/VideoEntry';
import BottomNavigation from '@/components/BottomNavigation';
import SectionTitle from '@/components/SectionTitle.vue';
import GradientBackground from '@/components/GradientBackground.vue';
import Invidious from '@/plugins/services/invidious';

export default {
  name: 'Home',
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
      return this.$store.getters['user/isLoggedIn'];
    }
  },
  mounted() {
    this.loadHomepage();
  },
  methods: {
    async loadHomepage() {
      const invidious = new Invidious(this.$store.getters['instances/currentInstanceApi']);
      await invidious.api
        .popular()
        .then(response => {
          this.videos = response.data;
        })
        .catch(error => {
          console.error(error);
        });
      await this.$axios
        .get(`${this.$store.getters['environment/apiUrl']}user/subscriptions/videos`, {
          withCredentials: true
        })
        .then(response => {
          this.subscriptions = response.data.slice(0, 4);
        })
        .catch(error => {
          console.log(error);
        });
    },
    showMoreVideos() {},
    handleScroll(e) {
      this.$emit('scroll', e);
    }
  }
};
</script>

<style lang="scss">
.home {
  .section-title {
    max-width: $main-width;
    margin: 0 auto;
    .title {
      margin: 0 0 0 15px;
    }
  }
  .home-videos-container {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    padding: 0 15px;
    box-sizing: border-box;
    z-index: 10;
    background-color: var(--bgcolor-main);
    @include viewtube-grid;
  }
}
</style>
