<template>
  <div class="embed">
    <VideoPlayer :video="video" :embedded="true" class="video-player-p" />
  </div>
</template>

<script lang="ts">
import Commons from '@/plugins/commons.ts';
import VideoPlayer from '@/components/videoplayer/VideoPlayer.vue';
import ViewTubeApi from '@/plugins/services/viewTubeApi.ts';
import Vue from 'vue';

export default Vue.extend({
  name: 'EmbedVideo',
  components: {
    VideoPlayer
  },
  asyncData({ params, store }) {
    const viewTubeApi = new ViewTubeApi(store.getters['environment/apiUrl']);
    return viewTubeApi.api
      .videos({
        id: params.id
      })
      .then(response => {
        return {
          video: response.data
        };
      })
      .catch(error => {
        console.log(error);
      });
  },
  data: () => ({
    video: {},
    commons: Commons
  }),
  methods: {
    loadData(data: any): void {
      this.video = data;
      this.loading = false;
    }
  }
});
</script>

<style lang="scss" scoped>
.embed {
  height: 100vh;
  width: 100vw;
}
</style>
