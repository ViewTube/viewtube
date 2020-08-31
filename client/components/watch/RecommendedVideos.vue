<template>
  <div class="recommended-videos">
    <div class="recommended-videos-container">
      <VideoEntry
        v-for="video in recommendedVideosShort"
        :key="video.videoId"
        :video="video"
      />
      <div class="show-more-container">
        <BadgeButton
          :click="expand"
          v-if="!videosExpanded"
        >
          <LoadMoreIcon />
          <p>show more</p>
        </BadgeButton>
      </div>
    </div>
  </div>
</template>

<script>
import VideoEntry from '@/components/list/VideoEntry'
import BadgeButton from '@/components/buttons/BadgeButton'
import LoadMoreIcon from 'vue-material-design-icons/Reload'

export default {
  name: 'recommended-videos',
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
  mounted() {
    this.recommendedVideosShort = this.recommendedVideos.slice(0, 4)
  },
  watch: {
    recommendedVideos(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.recommendedVideosShort = this.recommendedVideos.slice(0, 4)
      }
    }
  },
  methods: {
    expand() {
      this.recommendedVideosShort = this.recommendedVideos
      this.videosExpanded = true
    }
  }
}
</script>

<style lang="scss">
.recommended-videos {
  .recommended-videos-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;

    .show-more-container {
      display: flex;

      .badge-btn {
        margin: 0 auto;
      }
    }
  }
}
</style>
