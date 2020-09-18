<template>
  <div class="recommended-videos">
    <div class="recommended-videos-container">
      <VideoEntry v-for="video in recommendedVideosShort" :key="video.videoId" :video="video" />
      <div class="show-more-container">
        <BadgeButton v-if="!videosExpanded" :click="expand">
          <LoadMoreIcon />
          <p>show more</p>
        </BadgeButton>
      </div>
    </div>
  </div>
</template>

<script>
import VideoEntry from '@/components/list/VideoEntry';
import BadgeButton from '@/components/buttons/BadgeButton';
import LoadMoreIcon from 'vue-material-design-icons/Reload';

export default {
  name: 'RecommendedVideos',
  components: {
    VideoEntry,
    BadgeButton,
    LoadMoreIcon
  },
  props: {
    recommendedVideos: {
      required: true,
      type: Array
    }
  },
  data: () => ({
    recommendedVideosShort: null,
    videosExpanded: false
  }),
  watch: {
    recommendedVideos(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.recommendedVideosShort = this.recommendedVideos.slice(0, 4);
      }
    }
  },
  mounted() {
    this.recommendedVideosShort = this.recommendedVideos.slice(0, 4);
  },
  methods: {
    expand() {
      this.recommendedVideosShort = this.recommendedVideos;
      this.videosExpanded = true;
    }
  }
};
</script>

<style lang="scss">
.recommended-videos {
  .recommended-videos-container {
    display: grid;
    grid-template-columns: minmax(300px, 1fr);
    // grid-auto-rows: minmax(300px, auto);
    gap: 1em 2em;
    padding: 0 15px;

    .show-more-container {
      display: flex;

      .badge-btn {
        margin: 0 auto;
      }
    }
  }
}
</style>
