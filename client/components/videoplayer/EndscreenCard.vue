<template>
  <a
    ref="endscreenCard"
    :href="linkUrl"
    target="_blank"
    rel="noreferrer noopener"
    class="endscreen-card"
    :class="{ visible: visible }"
    :style="{
      top: `${positionTop}%`,
      left: `${positionLeft}%`,
      width: `${cardWidth}%`,
      height: `${cardHeight}%`
    }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click.stop="onClick"
    @mouseup.stop="onMouseUp"
  >
    <div class="card-background-container">
      <div class="card-background-overlay" />
      <img class="card-background" :src="backgroundImage" alt="Thumbnail Image" />
    </div>
    <div class="card-info-container">
      <p class="card-title">{{ card.title }}</p>
      <p v-if="card.viewCountText" class="card-views">
        {{ card.viewCountText }}
      </p>
    </div>
  </a>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'EndscreenCard',
  props: {
    card: Object,
    videoProgress: Number,
    videoHeight: Number,
    videoWidth: Number
  },
  computed: {
    elementType(): string {
      if (this.card.type === 'website') {
        return 'a';
      }
      return 'nuxt-link';
    },
    linkUrl(): string {
      if (this.card.type === 'website') {
        return this.card.websiteUrl;
      } else if (this.card.type === 'channel') {
        return `/channel/${this.card.authorId}`;
      } else if (this.card.type === 'playlist') {
        return this.card.playlistUrl;
      } else {
        return `/watch/?v=${this.card.videoId}`;
      }
    },
    visible(): boolean {
      const startTime = this.card.timing.start;
      const endTime = this.card.timing.end;
      const videoProgressMs = this.videoProgress * 1000;

      return videoProgressMs > startTime && videoProgressMs < endTime;
    },
    positionTop(): number {
      return this.card.dimensions.top * 100;
    },
    positionLeft(): number {
      return this.card.dimensions.left * 100;
    },
    cardWidth(): number {
      return this.card.dimensions.width * 100;
    },
    cardHeight(): number {
      return (
        ((this.card.dimensions.width * 100) / this.card.dimensions.aspectRatio) *
        this.videoAspectRatio
      );
    },
    videoAspectRatio(): number {
      return this.videoWidth / this.videoHeight;
    },
    backgroundImage(): string {
      switch (this.card.type) {
        case 'video':
          return this.card.videoThumbnails[1].url;
        case 'channel':
          return this.card.authorThumbnails[1].url;
        case 'website':
          return this.card.websiteThumbnails[1].url;
        case 'playlist':
          return this.card.playlistThumbnails[1].url;
        default:
          return this.card.videoThumbnails[1].url;
      }
    }
  },
  methods: {
    onMouseEnter() {
      this.$emit('cardenter');
    },
    onMouseLeave() {
      this.$emit('cardleave');
    },
    onClick(e) {
      if (this.card.type !== 'website') {
        this.$router.push(this.linkUrl);
        e.preventDefault();
      }
      e.stopPropagation();
    },
    onMouseUp(e) {
      e.stopPropagation();
      e.preventDefault();
    }
  }
});
</script>

<style lang="scss" scoped>
.endscreen-card {
  position: absolute;
  overflow: hidden;
  box-sizing: border-box;
  background-color: var(--bgcolor-alt-light);
  box-shadow: $low-shadow;
  cursor: pointer;
  transition-duration: 300ms;
  transition-timing-function: $intro-easing;
  transition-property: opacity, transform, border, box-shadow;

  opacity: 0;
  transform: scale(0.9);

  &.visible {
    opacity: 1;
    transform: scale(1);
    pointer-events: all;
  }

  &:hover {
    box-shadow: $max-shadow;
  }

  .card-background-container {
    height: 100%;
    position: relative;

    .card-background-overlay {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-image: linear-gradient(to bottom, #000, #00000000, #00000000);
      z-index: 138;
    }

    .card-background {
      width: 101%;
      position: relative;
      top: 50%;
      transform: translateY(-50%);
      z-index: 137;
    }
  }

  .card-info-container {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 139;
    height: 100%;
    width: 100%;

    .card-title {
      line-height: 20px;
      margin: 10px;
      font-family: $default-font;
      color: var(--title-color);
    }

    .card-views {
      margin: 5px 10px;
      line-height: 20px;
      color: var(--subtitle-color);
    }
  }
}
</style>
