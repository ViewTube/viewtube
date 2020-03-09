<template>
  <div class="recommended-videos">
    <div class="recommended-videos-container">
      <VideoEntry
        v-for="video in recommendedVideosShort"
        :key="video.videoId"
        :video="video"
      />
      <div class="show-more-container">
        <span
          class="badge-btn"
          style="cursor: pointer"
          v-ripple
          @click.prevent="expand"
          v-if="!videosExpanded"
        >show more</span>
      </div>
    </div>
  </div>
</template>

<script>
import VideoEntry from '@/components/list/VideoEntry'

export default {
  name: 'recommended-videos',
  components: {
    VideoEntry
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
  display: flex;
  padding: 10px;
  flex-direction: row;

  .recommended-videos-container {
    display: flex;
    flex-direction: column;

    .show-more-container {
      display: flex;
      
      .badge-btn {
        margin: 0 auto;
      }
    }
  }
}
</style>
