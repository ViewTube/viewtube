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
            query: { ...$route.query, v: getPreviousVideoId() }
          }"
          class="playlist-action"
        >
          <VTIcon name="mdi:skip-previous" :title="null" />
        </nuxt-link>
        <nuxt-link
          v-ripple
          v-tippy="'Skip to next video'"
          :tabindex="currentVideoId === getNextVideoId() ? -1 : 0"
          :class="{ disabled: currentVideoId === getNextVideoId() && !repeatEnabled }"
          :to="{
            path: getFullPath(),
            query: { ...$route.query, v: getNextVideoId() }
          }"
          class="playlist-action"
        >
          <VTIcon name="mdi:skip-next" :title="null" />
        </nuxt-link>
        <button
          v-ripple
          v-tippy="'Repeat playlist'"
          class="playlist-action playlist-action-btn"
          :class="{ enabled: repeatEnabled }"
          @click.stop.prevent="onRepeatToggle"
        >
          <VTIcon name="mdi:repeat" :title="null" />
        </button>
        <button
          v-ripple
          v-tippy="'Shuffle playlist'"
          class="playlist-action playlist-action-btn"
          :class="{ enabled: shuffleEnabled }"
          @click.stop.prevent="onShuffleToggle"
        >
          <VTIcon name="mdi:shuffle" :title="null" />
        </button>
        <button
          v-ripple
          v-tippy="'Play in reverse order'"
          class="playlist-action playlist-action-btn"
          :class="{ enabled: reverseEnabled }"
          @click.stop.prevent="onReverseToggle"
        >
          <VTIcon name="mdi:rotate-left" :title="null" />
        </button>
      </div>
    </div>
    <div ref="videoSectionRef" class="video-section">
      <nuxt-link
        v-for="(video, i) in playlist.items"
        :key="i"
        :to="{
          path: getFullPath(),
          query: { ...$route.query, v: video.id }
        }"
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
import { Result } from 'ytpl';
import { PropType } from 'vue';

export default defineComponent({
  name: 'PlaylistSection',
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

    if (route.query.repeat === 'true') {
      repeatEnabled.value = true;
    }
    if (route.query.shuffle === 'true') {
      shuffleEnabled.value = true;
    }
    if (route.query.reverse === 'true') {
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
        if (repeatEnabled.value) {
          return props.playlist.items[0].id;
        }
        return props.playlist.items[currentVideoIndex].id;
      }
      return props.playlist.items[currentVideoIndex + 1].id;
    };

    const onRepeatToggle = () => {
      toggleQueryParam('repeat', !repeatEnabled.value);
      repeatEnabled.value = !repeatEnabled.value;
    };

    const onShuffleToggle = () => {
      toggleQueryParam('shuffle', !shuffleEnabled.value);
      shuffleEnabled.value = !shuffleEnabled.value;
    };

    const onReverseToggle = () => {
      toggleQueryParam('reverse', !reverseEnabled.value);
      reverseEnabled.value = !reverseEnabled.value;
    };

    const toggleQueryParam = (param: string, value: boolean) => {
      const query = Object.assign({}, route.query);
      if (value) {
        query[param] = value.toString();
      } else {
        delete query[param];
      }
      router.push({
        path: route.path,
        query,
        replace: true
      });
    };

    const getFullPath = () => route.fullPath;

    const playNextVideo = () => {
      const currentVideoIndex = props.playlist.items.findIndex(
        el => el.id === props.currentVideoId
      );

      let nextVideoId = getNextVideoId();

      if (repeatEnabled.value) {
        if (currentVideoIndex + 1 === props.playlist.items.length) {
          nextVideoId = props.playlist.items[0].id;
        }
      }

      if (reverseEnabled.value) {
        if (currentVideoIndex - 1 >= 0) {
          nextVideoId = getPreviousVideoId();
        } else if (repeatEnabled.value) {
          nextVideoId = props.playlist.items[props.playlist.items.length - 1].id;
        }
      }

      if (shuffleEnabled.value) {
        nextVideoId = getRandomVideoId(currentVideoIndex);
      }

      if (props.playlist.items[currentVideoIndex].id !== nextVideoId) {
        router.push({
          path: getFullPath(),
          query: { ...route.query, v: nextVideoId }
        });
      }
    };

    const getRandomVideoId = (currentIndex: number) => {
      const randomIndex = Math.floor(Math.random() * props.playlist.items.length);
      if (randomIndex === currentIndex) {
        return getRandomVideoId(currentIndex);
      }
      return props.playlist.items[randomIndex].id;
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
      getNextVideoId,
      shuffleEnabled,
      repeatEnabled,
      reverseEnabled,
      onRepeatToggle,
      onShuffleToggle,
      onReverseToggle,
      getFullPath,
      playNextVideo
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

        &.vt-icon,
        .vt-icon {
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
