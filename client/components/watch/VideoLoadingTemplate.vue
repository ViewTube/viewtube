<template>
  <div class="video-loading-template">
    <div
      v-if="backgroundThumbnail"
      class="blurred-background"
      :style="{ 'background-image': `url(${imgProxyUrl + backgroundThumbnail.url})` }"
    />
    <div class="centered-card">
      <Spinner class="" />
      <p>Loading video</p>
      <h2>{{ video.title }}</h2>
      <h3>{{ video.author }}</h3>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';
import Spinner from '@/components/Spinner.vue';
import { useImgProxy } from '~/plugins/proxy';

export default defineComponent({
  name: 'VideoLoadingTemplate',
  components: { Spinner },
  props: {
    video: Object
  },
  setup(props) {
    const imgProxy = useImgProxy();

    const backgroundThumbnail = props.video.videoThumbnails.find(
      (el: any) => el.width === 480 && el.height === 360
    );

    return {
      backgroundThumbnail,
      imgProxyUrl: imgProxy.url
    };
  }
});
</script>

<style lang="scss">
.video-loading-template {
  height: calc(100vh - #{$header-height});
  position: relative;

  .blurred-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    filter: blur(10px);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
  }

  .centered-card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    background-color: var(--bgcolor-main);
    padding: 25px 10px;
    border-radius: 5px;
    width: 100%;
    max-width: 500px;
  }
}
</style>
