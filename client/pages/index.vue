<template>
  <div class="home">
    <GradientBackground :color="'theme'" />
    <SectionTitle v-if="userAuthenticated" :title="'Subscriptions'" :link="'subscriptions'" />
    <div v-if="userAuthenticated" class="home-videos-container small">
      <VideoEntry v-for="video in subscriptions" :key="video.videoId" :video="video" />
    </div>
    <SectionTitle :title="'Popular videos'" :gradient="!userAuthenticated" />
    <div class="home-videos-container small">
      <VideoEntry v-for="video in displayedVideos" :key="video.videoId" :video="video" />
    </div>
    <BadgeButton v-if="displayedVideos.length !== videos.length" :click="showMoreVideos">
      <LoadMoreIcon />
      <p>Show more</p>
    </BadgeButton>
  </div>
</template>

<script>
import Commons from '@/plugins/commons.js';
import VideoEntry from '@/components/list/VideoEntry';
import SectionTitle from '@/components/SectionTitle.vue';
import GradientBackground from '@/components/GradientBackground.vue';
import LoadMoreIcon from 'vue-material-design-icons/Reload';
import Invidious from '@/plugins/services/invidious';
import BadgeButton from '@/components/buttons/BadgeButton';

export default {
  name: 'Home',
  components: {
    VideoEntry,
    SectionTitle,
    GradientBackground,
    LoadMoreIcon,
    BadgeButton
  },
  data: () => ({
    videos: [],
    displayedVideos: [],
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
    showMoreVideos() {
      this.displayedVideos = this.videos;
    },
    async loadHomepage() {
      const invidious = new Invidious(this.$store.getters['instances/currentInstanceApi']);
      await invidious.api
        .popular()
        .then(response => {
          this.videos = response.data;
          this.displayedVideos = response.data.slice(0, 8);
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
    handleScroll(e) {
      this.$emit('scroll', e);
    }
  },
  head() {
    return {
      title: `ViewTube :: An alternative YouTube frontend`
    };
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
