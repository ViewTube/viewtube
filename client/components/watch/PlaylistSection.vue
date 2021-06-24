<template>
  <div class="playlist-section">
    <div class="info-section">
      <p class="playlist-title">{{ playlist.title }}</p>
      <p class="playlist-author">{{ playlist.author.name }}</p>
      <div class="control-section">
        <nuxt-link
          v-ripple
          :tabindex="currentVideoId === getPreviousVideoId() ? -1 : 0"
          :class="{ disabled: currentVideoId === getPreviousVideoId() }"
          :to="`/watch?v=${getPreviousVideoId()}&list=${playlist.id}`"
          class="playlist-action"
        >
          <SkipPreviousIcon />
        </nuxt-link>
        <nuxt-link
          v-ripple
          :tabindex="currentVideoId === getNextVideoId() ? -1 : 0"
          :class="{ disabled: currentVideoId === getNextVideoId() }"
          :to="`/watch?v=${getNextVideoId()}&list=${playlist.id}`"
          class="playlist-action"
        >
          <SkipNextIcon />
        </nuxt-link>
        <button class="playlist-action playlist-action-btn">
          <RepeatIcon />
        </button>
        <button class="playlist-action playlist-action-btn">
          <ShuffleIcon />
        </button>
      </div>
    </div>
    <div ref="videoSectionRef" class="video-section">
      <nuxt-link
        v-for="(video, i) in playlist.items"
        :key="i"
        :to="`/watch?v=${video.id}&list=${playlist.id}`"
        class="video"
        :class="{ current: video.id === currentVideoId }"
      >
        <div class="thumbnail">
          <div class="thumbnail-inner">
            <img :src="imgProxyUrl + video.thumbnails[3].url" alt="Playlist video thumbnail" />
          </div>
        </div>
        <div class="info">
          <p v-tippy="video.title" class="title">
            {{ video.title }}
          </p>
          <p class="author">
            {{ video.author.name }}
          </p>
        </div>
      </nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, useRouter } from '@nuxtjs/composition-api';
import SkipPreviousIcon from 'vue-material-design-icons/SkipPrevious.vue';
import SkipNextIcon from 'vue-material-design-icons/SkipNext.vue';
import RepeatIcon from 'vue-material-design-icons/Repeat.vue';
import ShuffleIcon from 'vue-material-design-icons/Shuffle.vue';
import { Result } from 'ytpl';
import { useImgProxy } from '@/plugins/proxy';

export default defineComponent({
  name: 'PlaylistSection',
  components: {
    SkipPreviousIcon,
    SkipNextIcon,
    RepeatIcon,
    ShuffleIcon
  },
  props: {
    playlist: Object as PropType<Result>,
    currentVideoId: String
  },
  setup(props) {
    const imgProxy = useImgProxy();
    const router = useRouter();

    const videoSectionRef = ref(null);

    const getPreviousVideoId = (): string => {
      const currentVideoIndex = props.playlist.items.findIndex(
        el => el.id === props.currentVideoId
      );
      if (currentVideoIndex <= 0) {
        return props.playlist.items[0].id;
      }
      return props.playlist.items[currentVideoIndex - 1].id;
    };

    const getNextVideoId = (): string => {
      const currentVideoIndex = props.playlist.items.findIndex(
        el => el.id === props.currentVideoId
      );
      if (currentVideoIndex + 1 === props.playlist.items.length) {
        return props.playlist.items[props.playlist.items.length].id;
      }
      return props.playlist.items[currentVideoIndex + 1].id;
    };

    onMounted(() => {
      if (videoSectionRef.value) {
        const selectedEl = videoSectionRef.value.getElementsByClassName('current')[0];
        if (selectedEl) {
          const topPos = selectedEl.offsetTop;
          videoSectionRef.value.scrollTop = topPos < 68 ? topPos : topPos - 68;
        }
      }
    });

    return {
      imgProxyUrl: imgProxy.url,
      videoSectionRef,
      getPreviousVideoId,
      getNextVideoId
    };
  }
});
</script>

<style lang="scss">
.playlist-section {
  .info-section {
    .playlist-title {
      color: var(--title-color);
    }
    .playlist-author {
      color: var(--subtitle-color);
      font-size: 0.9rem;
    }

    .control-section {
      display: flex;

      .playlist-action {
        width: 36px;
        height: 36px;
        margin: 2px;

        &.playlist-action-btn {
          all: unset;
          width: 36px;
          height: 36px;
        }

        &.material-design-icon,
        .material-design-icon,
        .material-design-icon__svg {
          width: 100%;
          height: 100%;
        }

        &.disabled {
          pointer-events: none;
          user-select: none;
          opacity: 0.5;
        }
      }
    }
  }
  .video-section {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: var(--bgcolor-alt);
    overflow: hidden scroll;
    max-height: 400px;
    padding: 10px 0;
    box-sizing: border-box;
    counter-reset: videos-counter 0;

    .video {
      display: flex;
      flex-direction: row;
      width: 100%;
      padding: 10px;
      counter-increment: css-counter 1;
      box-sizing: border-box;

      &::before {
        content: counter(css-counter) '. ';
        width: 35px;
        min-width: 35px;
        margin: auto 0;
      }

      &.current {
        background-color: var(--bgcolor-alt-light);
      }

      .thumbnail {
        margin: 0 10px 0 0;

        .thumbnail-inner {
          padding-top: 56.25%;
          position: relative;
          overflow: hidden;
          width: 82px;

          img {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 100%;
            display: block;
          }
        }
      }
      .info {
        overflow: hidden;
        p {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .title {
          font-size: 1rem;
          color: var(--title-color);
        }
        .author {
          font-size: 0.9rem;
          color: var(--subtitle-color);
        }
      }
    }
  }
}
</style>
