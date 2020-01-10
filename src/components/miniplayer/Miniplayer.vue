<template>
  <div
    class="miniplayer"
    v-if="video"
  >
    <VideoPlayer
      :video="video"
      :embedded="true"
    />
  </div>
</template>

<script>
import VideoPlayer from '@/components/videoplayer/VideoPlayer.vue'
import MiniplayerStore from '@/store/miniplayer.js'

export default {
  name: 'miniplayer',
  components: {
    VideoPlayer
  },
  data: () => ({
    video: MiniplayerStore.currentVideo
  })
}
</script>

<style lang="scss" scoped>
.miniplayer {
  position: fixed;
  bottom: 0;
  right: 0;
}
</style>
