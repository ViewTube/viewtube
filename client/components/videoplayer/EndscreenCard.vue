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
import { computed, defineComponent, useRouter } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'EndscreenCard',
  props: {
    card: Object,
    videoProgress: Number,
    videoHeight: Number,
    videoWidth: Number
  },
  setup(props, { emit }) {
    const router = useRouter();

    const elementType = computed((): string => {
      if (props.card.type === 'website') {
        return 'a';
      }
      return 'nuxt-link';
    });
    const linkUrl = computed((): string => {
      if (props.card.type === 'website') {
        return props.card.websiteUrl;
      } else if (props.card.type === 'channel') {
        return `/channel/${props.card.authorId}`;
      } else if (props.card.type === 'playlist') {
        return props.card.playlistUrl;
      } else {
        return `/watch/?v=${props.card.videoId}`;
      }
    });
    const visible = computed((): boolean => {
      const startTime = props.card.timing.start;
      const endTime = props.card.timing.end;
      const videoProgressMs = props.videoProgress * 1000;

      return videoProgressMs > startTime && videoProgressMs < endTime;
    });
    const positionTop = computed((): number => {
      return props.card.dimensions.top * 100;
    });
    const positionLeft = computed((): number => {
      return props.card.dimensions.left * 100;
    });
    const cardWidth = computed((): number => {
      return props.card.dimensions.width * 100;
    });
    const cardHeight = computed((): number => {
      return (
        ((props.card.dimensions.width * 100) / props.card.dimensions.aspectRatio) *
        videoAspectRatio.value
      );
    });
    const videoAspectRatio = computed((): number => {
      return props.videoWidth / props.videoHeight;
    });
    const backgroundImage = computed((): string => {
      switch (props.card.type) {
        case 'video':
          return props.card.videoThumbnails[1].url;
        case 'channel':
          return props.card.authorThumbnails[1].url;
        case 'website':
          return props.card.websiteThumbnails[1].url;
        case 'playlist':
          return props.card.playlistThumbnails[1].url;
        default:
          return props.card.videoThumbnails[1].url;
      }
    });

    const onMouseEnter = () => {
      emit('cardenter');
    };
    const onMouseLeave = () => {
      emit('cardleave');
    };
    const onClick = (e: Event) => {
      if (props.card.type !== 'website') {
        router.push(linkUrl.value);
        e.preventDefault();
      }
      e.stopPropagation();
    };
    const onMouseUp = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
    };

    return {
      elementType,
      linkUrl,
      visible,
      positionTop,
      positionLeft,
      cardWidth,
      cardHeight,
      videoAspectRatio,
      backgroundImage,
      onMouseEnter,
      onMouseLeave,
      onClick,
      onMouseUp
    };
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
