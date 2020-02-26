<template>
  <div class="channel-banner" ref="parallaxParent">
    <img class="channel-banner-image" :src="src" ref="parallaxImage" />
  </div>
</template>

<script>
export default {
  name: 'channel-banner',
  props: {
    src: String
  }
}
</script>

<style lang="scss" scoped>
.channel-banner {
  width: 100%;
  transform-origin: 0 0;
  transform: translateZ(-4px) scale(2);

  .channel-banner-image {
    width: 100%;
    position: relative;
    max-height: 500px;
    transition: transform 100ms linear;

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
