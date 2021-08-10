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
import { defineComponent, ref, useFetch, useRoute } from '@nuxtjs/composition-api';
import VideoPlayer from '@/components/videoplayer/VideoPlayer.vue';
import ViewTubeApi from '@/plugins/services/viewTubeApi';
import { useAccessor } from '@/store';

export default defineComponent({
  name: 'EmbedVideo',
  components: {
    VideoPlayer
  },
  setup() {
    const route = useRoute();
    const accessor = useAccessor();

    const video = ref(null);

    useFetch(async () => {
      const viewTubeApi = new ViewTubeApi(accessor.environment.apiUrl);
      await viewTubeApi.api
        .videos({
          id: route.value.params.id
        })
        .then((response: { data: any }) => {
          video.value = response.data;
        })
        .catch((_: any) => {});
    });

    return {
      video
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
