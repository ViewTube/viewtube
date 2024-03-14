<script setup lang="ts">
const video = inject<ApiDto<'VTVideoInfoDto'>>('video');
const videoState = inject<VideoState>('videoState');

const onPosterClick = () => {
  if (videoState.video.buffering) return;
  videoState.setPosterVisible(false);
  videoState.play();
};
</script>

<template>
  <transition name="fade">
    <div
      v-if="videoState.video.posterVisible"
      class="flip-poster"
      @click.stop.prevent="onPosterClick"
    >
      <img :src="video.thumbnails[0].url" class="flip-poster-img" />
      <Spinner v-if="videoState.video.buffering" class="flip-play-spinner" />
      <VTIcon v-else name="mdi:play" class="flip-play-icon" />
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 400ms $intro-easing,
    filter 400ms $intro-easing;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  filter: saturate(0);
}
.flip-poster {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 11;
  user-select: none;
  background-color: #000;

  .flip-play-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 4rem;
    color: #fff;
  }

  .flip-play-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .flip-poster-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>
