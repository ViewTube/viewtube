<template>
  <div class="embed">
    <VideoPlayer :video="video" :embedded="true" class="video-player-p" />
  </div>
</template>

<script>
import Commons from '@/plugins/commons.js';
import VideoPlayer from '@/components/videoplayer/VideoPlayer.vue';
import ViewTubeApi from '@/plugins/services/viewTubeApi';

export default {
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
  beforeRouteUpdate(to, from, next) {
    const videoId = to.params.id;
    fetch(`${Commons.getApiUrl()}videos/${videoId}`, {
      cache: 'force-cache',
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        this.loadData(data);
        next();
      })
      .catch(error => {
        console.error(error);
        next();
      });
  },
  methods: {
    loadData(data) {
      this.video = data;
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.embed {
  height: 100vh;
  width: 100vw;
}
</style>
