<template>
  <div
    class="miniplayer"
    v-if="$store.state.miniplayer.currentVideo && visible"
  >
    <VideoPlayer
      :video="$store.state.miniplayer.currentVideo"
      :embedded="true"
      :autoplay="true"
    />
  </div>
</template>

<script>
import VideoPlayer from '@/components/videoplayer/VideoPlayer.vue'

export default {
  name: 'miniplayer',
  components: {
    VideoPlayer
  },
  data() {
    return {
      video: this.$store.state.miniplayer.currentVideo
    }
  },
  computed: {
    visible() {
      return this.$route.name !== 'watch'
    }
  }
}
</script>

<style lang="scss" scoped>
.miniplayer {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 500px;
  height: 280px;
  z-index: 800;

  @media screen and (max-width: 1100px) {
    width: 450px;
    height: 250px;
  }

  @media screen and (max-width: 900px) {
    width: 400px;
    height: 225px;
  }

  @media screen and (max-width: 700px) {
    width: 300px;
    height: 170px;
  }
}
</style>
