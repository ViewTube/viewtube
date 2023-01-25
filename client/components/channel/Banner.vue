<script setup lang="ts">
import EyeIcon from 'vue-material-design-icons/Eye.vue';

const props = defineProps<{
  src: string;
  bannerHqSrc: string;
}>();

const imgProxy = useImgProxy();

const onBannerContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  window.open(imgProxy.url + props.bannerHqSrc, '_blank');
};
</script>

<template>
  <div class="channel-banner" @contextmenu="onBannerContextMenu">
    <img
      ref="bannerImage"
      class="channel-banner-image"
      :src="imgProxy.url + src"
      alt="Channel banner"
    />
    <div class="additional-content">
      <a
        v-tippy="'Show full size banner'"
        class="show-btn"
        :href="imgProxy.url + bannerHqSrc"
        target="_blank"
        rel="noreferrer noopener"
        ><EyeIcon
      /></a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.channel-banner {
  width: 100%;
  z-index: 12;
  position: relative;

  &:hover {
    .additional-content {
      .show-btn {
        clip-path: circle(15px at 50% 50%);
      }
    }
  }

  .additional-content {
    position: absolute;
    display: flex;
    z-index: 13;
    bottom: 0;
    right: 0;
    flex-direction: row;
    justify-content: space-between;

    .show-btn {
      margin: 0 20px 10px 0;
      clip-path: circle(15px at 50% 120%);
      transition: clip-path 300ms $intro-easing;
      filter: drop-shadow(0 0 1px #000);

      &:focus {
        &::after {
          display: none;
        }
      }
    }
  }

  .channel-banner-image {
    width: 100%;
    position: relative;
    max-height: 500px;
    transition: transform 100ms linear;
    display: block;

    @media screen and (max-width: 900px) {
      width: 130%;
      left: calc(100vw - 115%);
    }

    @media screen and (max-width: 700px) {
      width: 160%;
      left: calc(100vw - 130%);
    }

    @media screen and (max-width: 500px) {
      width: 190%;
      left: calc(100vw - 145%);
    }
  }
}
</style>
