<template>
  <div class="inline-video">
    <div class="video">
      <transition name="reveal">
        <iframe v-if="showIframe" class="video-frame" :src="`/embed/${video.videoId}`" />
      </transition>
      <transition name="reveal">
        <div v-if="!showIframe" class="video-thumbnail" @click="onVideoClicked">
          <img class="video-thumbnail-img" :src="video.videoThumbnails[0].url" :alt="video.title" />
          <span class="play-btn"><PlayIcon /></span>
          <span class="video-length">{{
            $formatting.getTimestampFromSeconds(video.lengthSeconds)
          }}</span>
        </div>
      </transition>
    </div>
    <div class="video-info">
      <nuxt-link class="title" :to="`/watch?v=${video.videoId}`">{{ video.title }}</nuxt-link>
      <p class="views">{{ video.viewCount.toLocaleString('en-US') }} views</p>
      <p class="upload-date">{{ video.publishedText }}</p>
      <div v-show="isSmall" v-create-links class="description links">
        {{ smallDescription }}
      </div>
      <div v-show="!isSmall" v-create-links class="description links">
        {{ video.description }}
      </div>
      <BadgeButton v-if="isSmall" class="desc-show-more" :click="onShowFullDescription"
        >Show more</BadgeButton
      >
    </div>
  </div>
</template>

<script>
import PlayIcon from 'vue-material-design-icons/Play';
import BadgeButton from '@/components/buttons/BadgeButton';

export default {
  name: 'InlineVideo',
  components: {
    PlayIcon,
    BadgeButton
  },
  props: {
    video: Object
  },
  data() {
    return {
      showIframe: false,
      isSmall: true,
      smallDescription: ''
    };
  },
  created() {
    if (this.video.description.length > 300) {
      let smallDescription = this.video.description.split('\n')[0];
      if (smallDescription.length > 300) {
        smallDescription = `${this.video.description.substr(0, 300)}...`;
      }
      this.smallDescription = smallDescription;
    } else {
      this.isSmall = false;
    }
  },
  methods: {
    onVideoClicked() {
      this.showIframe = true;
    },
    onShowFullDescription() {
      this.isSmall = false;
    }
  }
};
</script>

<style lang="scss">
.reveal-enter-active,
.reveal-leave-active {
  transition: opacity 1s $intro-easing;
}
.reveal-enter-to,
.reveal-leave {
  opacity: 1;
}
.reveal-enter,
.reveal-leave-to {
  opacity: 0;
}

.inline-video {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1em;

  @media screen and (max-width: 900px) {
    grid-template-columns: 100%;
  }

  .video {
    position: relative;
    height: calc(100vw / 28 * 9);

    @media screen and (max-width: 900px) {
      height: calc(100vw / 16 * 9);
    }
    .video-thumbnail {
      position: absolute;
      width: 100%;
      cursor: pointer;

      .play-btn {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(5);
        transform-origin: center;
        height: 24px;
        width: 24px;
      }
      .video-length {
        position: absolute;
        color: $video-thmb-overlay-textcolor;
        right: 0;
        bottom: 0;
        padding: 2px 4px;
        margin: 8px 4px;
        background-color: $video-thmb-overlay-bgcolor;
        box-sizing: border-box;
        border-radius: 2px;
      }
      .video-thumbnail-img {
        width: 100%;
        position: relative;
        display: block;
      }
    }
    .video-frame {
      width: 100%;
      height: 100%;
      border: none;
      position: absolute;
    }
  }
  .video-info {
    .title {
      font-size: 1.1rem;
      margin: 0 0 10px 0;
      display: block;
    }
    .views {
      color: var(--subtitle-color-light);
      font-size: 0.9rem;
    }
    .upload-date {
      color: var(--subtitle-color-light);
      font-size: 0.9rem;
    }
    .description {
      color: var(--subtitle-color);
      white-space: pre-wrap;
      font-size: 0.9rem;
    }
  }
}
</style>
