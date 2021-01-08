<template>
  <div class="home">
    <GradientBackground :color="'theme'" />
    <SectionTitle v-if="userAuthenticated" :title="'Subscriptions'" :link="'subscriptions'" />
    <div v-if="userAuthenticated" class="home-videos-container small">
      <VideoEntry
        v-for="video in subscriptions"
        :key="video.videoId"
        :video="video"
        :lazy="false"
      />
    </div>
    <SectionTitle :title="'Popular videos'" :gradient="!userAuthenticated" />
    <div class="home-videos-container small">
      <VideoEntry
        v-for="(video, index) in displayedVideos"
        :key="index"
        :lazy="index < 4 ? false : true"
        :video="video"
      />
    </div>
    <BadgeButton
      v-if="displayedVideos.length !== videos.length"
      :click="showMoreVideos"
      class="home-show-more"
    >
      <LoadMoreIcon />
      <p>Show more</p>
    </BadgeButton>
  </div>
</template>

<script lang="ts">
import Commons from '@/plugins/commons.ts';
import VideoEntry from '@/components/list/VideoEntry.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import GradientBackground from '@/components/GradientBackground.vue';
import LoadMoreIcon from 'vue-material-design-icons/Reload.vue';
import ViewTubeApi from '@/plugins/services/viewTubeApi.ts';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import Vue from 'vue';

export default Vue.extend({
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
  async fetch() {
    await this.loadHomepage();
  },
  head() {
    return {
      title: `ViewTube :: An alternative YouTube frontend`
    };
  },
  computed: {
    userAuthenticated(): boolean {
      return this.$store.getters['user/isLoggedIn'];
    }
  },
  methods: {
    showMoreVideos(): void {
      this.displayedVideos = this.videos;
    },
    async loadHomepage(): Promise<void> {
      const viewTubeApi = new ViewTubeApi(this.$store.getters['environment/apiUrl']);
      await viewTubeApi.api
        .popular()
        .then(response => {
          this.videos = response.data.videos;
          this.displayedVideos = response.data.videos.slice(0, 8);
        })
        .catch(error => {
          console.error(error);
        });
      if (this.$store.getters['user/isLoggedIn']) {
        await this.$axios
          .get(`${this.$store.getters['environment/apiUrl']}user/subscriptions/videos?limit=4`, {
            withCredentials: true
          })
          .then(response => {
            this.subscriptions = response.data.videos;
          })
          .catch(_ => {});
      }
    },
    handleScroll(e: Event): void {
      this.$emit('scroll', e);
    }
  }
});
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

  .home-show-more {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 20px;
  }
}
</style>
