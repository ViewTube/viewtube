<template>
  <div ref="parallaxParent" class="channel-banner">
    <img
      ref="bannerImage"
      class="channel-banner-image"
      :src="imgProxyUrl + src"
      alt="Channel banner"
    />
    <div class="additional-content">
      <a
        v-tippy="'Show the banner'"
        class="show-btn"
        :href="imgProxyUrl + bannerHqSrc"
        target="_blank"
        rel="noreferrer noopener"
        ><EyeIcon
      /></a>
      <div v-if="bannerLinks && bannerLinks.length" class="banner-links">
        <a
          v-for="(link, index) in bannerLinks"
          :key="index"
          :href="link.url"
          target="_blank"
          rel="noreferrer noopener"
        >
          <img
            v-if="link.linkThumbnails"
            :src="imgProxyUrl + link.linkThumbnails[0].url"
            :alt="link.title"
          />
          {{ link.title }}
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import EyeIcon from 'vue-material-design-icons/Eye.vue';

import Vue from 'vue';
import { defineComponent, useStore } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'ChannelBanner',
  components: {
    EyeIcon
  },
  props: {
    src: String,
    bannerLinks: Array,
    bannerHqSrc: String
  },
  setup() {
    const store = useStore();
    const imgProxyUrl = store.getters['environment/imgProxyUrl'];

    return {
      imgProxyUrl
    };
  }
});
</script>

<style lang="scss" scoped>
.channel-banner {
  width: 100%;
  z-index: 12;

  &:hover {
    .additional-content {
      .show-btn {
        animation: blink-eye 2200ms $intro-easing;
        clip-path: circle(15px at 50% 50%);
      }
    }
  }

  .additional-content {
    position: absolute;
    display: flex;
    z-index: 13;
    bottom: 0;
    left: 0;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;

    .show-btn {
      padding: 10px 10px 0 10px;
      clip-path: circle(15px at 50% 120%);
      transition: clip-path 300ms $intro-easing;

      &:focus {
        &::after {
          display: none;
        }
      }
    }

    .banner-links {
      display: flex;
      flex-direction: row;
      a {
        background-color: #00000056;
        padding: 3px;
        border-radius: 5px;
        margin: 0 5px 5px 0;
        transition: background-color 200ms $intro-easing;

        &:focus {
          background-color: #00000083;
          &::after {
            display: none;
          }
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

@keyframes blink-eye {
  0% {
    clip-path: circle(15px at 50% 120%);
  }
  10% {
    clip-path: circle(15px at 50% 50%);
  }
  80% {
    clip-path: circle(15px at 50% 50%);
  }
  90% {
    clip-path: circle(15px at 50% 110%);
  }
  100% {
    clip-path: circle(15px at 50% 50%);
  }
}
</style>
