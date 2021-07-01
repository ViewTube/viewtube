<template>
  <div class="playlist-section">
    <div class="info-section">
      <p class="playlist-title">{{ playlist.title }}</p>
      <p class="playlist-author">{{ playlist.author.name }}</p>
      <div class="control-section">
        <nuxt-link
          v-ripple
          v-tippy="'Skip to previous video'"
          :tabindex="currentVideoId === getPreviousVideoId() ? -1 : 0"
          :class="{ disabled: currentVideoId === getPreviousVideoId() }"
          :to="{
            path: getFullPath(),
            query: { v: getPreviousVideoId() }
          }"
          class="playlist-action"
        >
          <SkipPreviousIcon :title="null" />
        </nuxt-link>
        <nuxt-link
          v-ripple
          v-tippy="'Skip to next video'"
          :tabindex="currentVideoId === getNextVideoId() ? -1 : 0"
          :class="{ disabled: currentVideoId === getNextVideoId() }"
          :to="{
            path: getFullPath(),
            query: { v: getNextVideoId() }
          }"
          class="playlist-action"
        >
          <SkipNextIcon :title="null" />
        </nuxt-link>
        <button
          v-ripple
          v-tippy="'Repeat playlist'"
          class="playlist-action playlist-action-btn"
          :class="{ enabled: repeatEnabled }"
          @click.stop.prevent="onRepeatToggle"
        >
          <RepeatIcon :title="null" />
        </button>
        <button
          v-ripple
          v-tippy="'Shuffle playlist'"
          class="playlist-action playlist-action-btn"
          :class="{ enabled: shuffleEnabled }"
          @click.stop.prevent="onShuffleToggle"
        >
          <ShuffleIcon :title="null" />
        </button>
        <button
          v-ripple
          v-tippy="'Play in reverse order'"
          class="playlist-action playlist-action-btn"
          :class="{ enabled: reverseEnabled }"
          @click.stop.prevent="onReverseToggle"
        >
          <ReverseIcon :title="null" />
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
import {
  defineComponent,
  onMounted,
  PropType,
  ref,
  useRoute,
  useRouter
} from '@nuxtjs/composition-api';
import SkipPreviousIcon from 'vue-material-design-icons/SkipPrevious.vue';
import SkipNextIcon from 'vue-material-design-icons/SkipNext.vue';
import RepeatIcon from 'vue-material-design-icons/Repeat.vue';
import ShuffleIcon from 'vue-material-design-icons/Shuffle.vue';
import ReverseIcon from 'vue-material-design-icons/RotateLeft.vue';
import { Result } from 'ytpl';
import { useImgProxy } from '@/plugins/proxy';

export default defineComponent({
  name: 'PlaylistSection',
  components: {
    SkipPreviousIcon,
    SkipNextIcon,
    RepeatIcon,
    ShuffleIcon,
    ReverseIcon
  },
  props: {
    playlist: Object as PropType<Result>,
    currentVideoId: String
  },
  setup(props) {
    const imgProxy = useImgProxy();
    const router = useRouter();
    const route = useRoute();

    const videoSectionRef = ref(null);

    const repeatEnabled = ref(false);
    const shuffleEnabled = ref(false);
    const reverseEnabled = ref(false);

    if (route.value.query.repeat) {
      repeatEnabled.value = true;
    }
    if (route.value.query.shuffle) {
      shuffleEnabled.value = true;
    }
    if (route.value.query.reverse) {
      reverseEnabled.value = true;
    }

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

    const onRepeatToggle = () => {
      router.push({
        path: route.value.fullPath,
        query: { repeat: (!repeatEnabled.value).toString() },
        replace: true
      });
      repeatEnabled.value = !repeatEnabled.value;
    };

    const onShuffleToggle = () => {
      router.push({
        path: route.value.fullPath,
        query: { shuffle: (!shuffleEnabled.value).toString() },
        replace: true
      });
      shuffleEnabled.value = !shuffleEnabled.value;
    };

    const onReverseToggle = () => {
      router.push({
        path: route.value.fullPath,
        query: { reverse: (!reverseEnabled.value).toString() },
        replace: true
      });
      reverseEnabled.value = !reverseEnabled.value;
    };

    const getFullPath = () => route.value.fullPath;

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
      getNextVideoId,
      shuffleEnabled,
      repeatEnabled,
      reverseEnabled,
      onRepeatToggle,
      onShuffleToggle,
      onReverseToggle,
      getFullPath
    };
  }
});
</script>

<style lang="scss">
.playlist-section {
  background-color: var(--bgcolor-alt);
  margin: 20px 0 0 0;
  border-radius: 5px;

  .info-section {
    padding: 10px 10px 0 10px;

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
        $btn-size: 30px;
        width: $btn-size;
        height: $btn-size;
        padding: 5px;
        border-radius: 25px;

        &.playlist-action-btn {
          all: unset;
          width: $btn-size;
          height: $btn-size;
          position: relative;
          cursor: pointer;
          padding: 5px;
          border-radius: 25px;

          &.enabled {
            color: var(--theme-color);
          }
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
    overflow: hidden scroll;
    max-height: 400px;
    padding: 0 0 10px 0;
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
