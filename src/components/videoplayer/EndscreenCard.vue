<template>
  <div
    class="endscreen-card"
    :class="{ visible: visible }"
    :style="{
      top: `${positionTop}px`,
      left: `${positionLeft}px`,
      width: `${cardWidth}px`,
      height: `${cardHeight}px`
    }"
  >
    <div class="card-background-container">
      <img class="card-background" :src="backgroundImage" alt="Thumbnail Image" />
    </div>
    <p class="card-title">{{ card.title }}</p>
  </div>
</template>

<script>
export default {
  name: 'endscreen-card',
  props: {
    card: Object,
    videoProgress: Number,
    videoHeight: Number,
    videoWidth: Number,
    videoOffsetTop: Number,
    videoOffsetLeft: Number
  },
  computed: {
    visible: function () {
      let startTime = this.card.timing.start
      let endTime = this.card.timing.end
      let videoProgressMs = this.videoProgress * 1000

      return videoProgressMs > startTime && videoProgressMs < endTime
    },
    positionTop: function () {
      return (this.videoHeight * this.card.dimensions.top) + this.videoOffsetTop
    },
    positionLeft: function () {
      return (this.videoWidth * this.card.dimensions.left) + this.videoOffsetLeft
    },
    cardWidth: function () {
      return this.videoWidth * this.card.dimensions.width
    },
    cardHeight: function () {
      return (this.videoWidth * this.card.dimensions.width) / this.card.dimensions.aspectRatio
    },
    backgroundImage: function () {
      switch (this.card.type) {
        case 'video':
          return this.card.videoThumbnails[1].url
        case 'channel':
          return this.card.authorThumbnails[1].url
        case 'website':
          return this.card.websiteThumbnails[1].url
        default:
          return this.card.videoThumbnails[1].url
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.endscreen-card {
  position: absolute;
  background-color: $bgcolor-main;
  overflow: hidden;
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 300ms $intro-easing, transform 300ms $intro-easing;

  &.visible {
    opacity: 1;
    transform: scale(1);
  }

  .card-background-container {
    height: 100%;
    .card-background {
      width: 100%;
      position: relative;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
