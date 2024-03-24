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
      <FlipLoading v-if="videoState.video.buffering" />
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        width="100"
        height="100"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="flip-play-icon"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path
          d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z"
        />
      </svg>
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

  @keyframes play-icon-animation {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
  }

  .flip-play-icon {
    position: absolute;
    top: calc(50% - 50px);
    left: calc(50% - 50px);
    font-size: 4rem;
    color: #fff;
    text-shadow: $low-shadow;
    filter: drop-shadow(0 4px 12px var(--theme-color-alt));
    animation: play-icon-animation 400ms $intro-easing;
  }

  .flip-poster-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>
