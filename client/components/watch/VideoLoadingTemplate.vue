<template>
  <div class="video-loading-template">
    <div class="centered-card">
      <Spinner class="" />
      <div class="fade-in">
        <p>Loading video</p>
        <h2>{{ video.title }}</h2>
        <h3>{{ typeof video.author === 'string' ? video.author : video.author.name }}</h3>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '#imports';
import Spinner from '@/components/Spinner.vue';


export default defineComponent({
  name: 'VideoLoadingTemplate',
  components: { Spinner },
  props: {
    video: Object
  },
  setup(props) {
    const imgProxy = useImgProxy();

    const backgroundThumbnail = computed(() => {
      if (props.video && props.video.videoThumbnails) {
        return props.video.videoThumbnails.find((el: any) => el.width === 480 && el.height === 360);
      }
      return '#';
    });

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

    .fade-in {
      animation: card-fade-in 300ms 1s $intro-easing forwards;
      opacity: 0;
    }
  }
}

@keyframes card-fade-in {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
