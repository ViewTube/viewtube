<template>
  <div class="embed">
    <VideoPlayer
      :video="video"
      :embedded="true"
      class="video-player-p"
      :mini="false"
      :autoplay="false"
    />
  </div>
</template>

<script lang="ts">
import VideoPlayer from '@/components/videoplayer/VideoPlayer.vue';

export default defineComponent({
  name: 'EmbedVideo',
  components: {
    VideoPlayer
  },
  setup() {
    const route = useRoute();

    const { data } = useGetVideos(route.params.id);

    return {
      video: data
    };
  }
});
</script>

<style lang="scss" scoped>
.embed {
  height: 100vh;
  width: 100vw;
}
</style>
