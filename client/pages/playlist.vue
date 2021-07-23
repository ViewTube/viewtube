<template>
  <div class="playlist">
    <Spinner v-if="$fetchState.pending && !playlist" class="centered" />
    <div v-if="playlist" class="thumbnail-banner-container">
      <div
        class="thumbnail-banner"
        :style="{ 'background-image': `url(${imgProxyUrl + playlist.thumbnails[0].url})` }"
      />
      <div class="gradient-to-color" />
      <div class="playlist-info">
        <nuxt-link :to="`/channel/${playlist.author.channelID}`" class="author-thumbnail-banner">
          <img
            class="author-thumbnail"
            :src="imgProxyUrl + playlist.author.bestAvatar.url"
            alt="Author thumbnail"
          />
          <div class="author-info">
            <p>{{ playlist.author.name }}</p>
          </div>
        </nuxt-link>
        <h2 class="playlist-title">{{ playlist.title }}</h2>
        <div class="playlist-details">
          <span class="playlist-detail"
            ><EyeIcon /> {{ playlist.views.toLocaleString('en-US') }} views</span
          >
          <span class="playlist-detail"
            ><CountIcon />{{ playlist.estimatedItemCount.toLocaleString('en-US') }} items</span
          >
          <span class="playlist-detail"><CalendarIcon />{{ playlist.lastUpdated }}</span>
          <span class="playlist-detail"
            ><EyeIcon v-if="playlist.visibility === 'everyone'" /><EyeClosedIcon
              v-else-if="playlist.visibility === 'unlisted'"
            />{{ playlist.visibility === 'everyone' ? 'public' : 'unlisted' }} playlist</span
          >
        </div>
      </div>
    </div>
    <div v-if="playlist" class="playlist-content-container">
      <pre
        v-if="playlist && playlist.description"
        v-create-links
        class="playlist-description links"
      >
        {{ playlist.description }}
      </pre>
      <div class="playlist-videos-container">
        <VideoEntry
          v-for="video in playlist.items"
          :key="video.videoId"
          :video="video"
          :playlistId="playlist.id"
          :lazy="false"
        />
      </div>
      <div v-if="playlistContinuation" class="load-more-btn">
        <BadgeButton :click="loadMoreVideos" :loading="moreVideosLoading"
          ><LoadMoreIcon />
          <p>show more</p></BadgeButton
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, useFetch, useMeta, useRoute } from '@nuxtjs/composition-api';
import Spinner from '@/components/Spinner.vue';
import VideoEntry from '@/components/list/VideoEntry.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import LoadMoreIcon from 'vue-material-design-icons/Reload.vue';
import { Continuation, Result } from 'ytpl';
import EyeIcon from 'vue-material-design-icons/EyeOutline.vue';
import EyeClosedIcon from 'vue-material-design-icons/EyeOffOutline.vue';
import CountIcon from 'vue-material-design-icons/Counter.vue';
import CalendarIcon from 'vue-material-design-icons/CalendarClock.vue';
import { useAxios } from '@/plugins/axiosPlugin';
import { useImgProxy } from '@/plugins/proxy';
import { useAccessor } from '~/store';

export default defineComponent({
  name: 'Playlist',
  components: {
    Spinner,
    EyeIcon,
    CountIcon,
    CalendarIcon,
    EyeClosedIcon,
    VideoEntry,
    BadgeButton,
    LoadMoreIcon
  },
  setup() {
    const accessor = useAccessor();
    const axios = useAxios();
    const route = useRoute();
    const imgProxy = useImgProxy();

    const moreVideosLoading = ref(false);
    const playlistContinuation: Ref<Continuation> = ref(null);
    const playlist: Ref<Result> = ref(null);

    useFetch(async () => {
      if (route.value.query && route.value.query.list) {
        const apiUrl = accessor.environment.apiUrl;
        await axios
          .get(`${apiUrl}playlists`, { params: { playlistId: route.value.query.list, pages: 1 } })
          .then(response => {
            if (response.data) {
              playlist.value = response.data;
              playlistContinuation.value = response.data.continuation;
            } else {
              accessor.messages.createMessage({
                type: 'error',
                title: 'Error loading playlist',
                message: 'Playlist may not be available'
              });
            }
          })
          .catch(_ => {
            accessor.messages.createMessage({
              type: 'error',
              title: 'Error loading playlist',
              message: 'Playlist may not be available'
            });
          });
      }
    });

    const loadMoreVideos = async () => {
      if (playlistContinuation.value) {
        moreVideosLoading.value = true;
        const apiUrl = accessor.environment.apiUrl;
        await axios
          .get(`${apiUrl}playlists/continuation`, {
            params: {
              continuationData: playlistContinuation.value
            }
          })
          .then((response: { data: any }) => {
            if (response && response.data) {
              playlist.value.items = playlist.value.items.concat(response.data.items);
              playlistContinuation.value = response.data.continuation;
              moreVideosLoading.value = false;
            }
          })
          .catch((_: any) => {
            accessor.messages.createMessage({
              type: 'error',
              title: 'Unable to load more results',
              message: 'Try again or use a different search term for more results'
            });
            moreVideosLoading.value = false;
          });
      }
    };

    useMeta(() => {
      if (playlist.value) {
        return {
          title: `${playlist.value.title} :: ${playlist.value.author.name} :: ViewTube`,
          meta: [
            {
              hid: 'description',
              vmid: 'descriptionMeta',
              name: 'description',
              content: playlist.value.description.substring(0, 100)
            },
            {
              hid: 'ogTitle',
              property: 'og:title',
              content: `${playlist.value.title} - ${playlist.value.author.name} - ViewTube`
            },
            {
              hid: 'ogImage',
              property: 'og:image',
              itemprop: 'image',
              content: playlist.value.thumbnails[2].url
            },
            {
              hid: 'ogDescription',
              property: 'og:description',
              content: playlist.value.description.substring(0, 100)
            }
          ]
        };
      }
    });

    return {
      playlist,
      moreVideosLoading,
      loadMoreVideos,
      playlistContinuation,
      imgProxyUrl: imgProxy.url
    };
  },
  head: {}
});
</script>

<style lang="scss">
.playlist {
  margin-top: $header-height;

  .thumbnail-banner-container {
    width: 100%;
    padding-top: 25%;
    position: relative;

    @media screen and (max-width: 1400px) {
      padding-top: 30%;
    }

    @media screen and (max-width: 1000px) {
      padding-top: 40%;
    }

    @media screen and (max-width: 760px) {
      padding-top: 45%;
    }

    @media screen and (max-width: $mobile-width) {
      padding-top: 50%;
    }

    @media screen and (max-width: 580px) {
      padding-top: 65%;
    }

    @media screen and (max-width: 450px) {
      padding-top: 85%;
    }

    .thumbnail-banner,
    .gradient-to-color {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .gradient-to-color {
      background: linear-gradient(to bottom, transparent, var(--bgcolor-main));
    }

    .thumbnail-banner {
      background-size: 100%;
      background-repeat: no-repeat;
      background-attachment: fixed;
      background-position: 0 $header-height;
      filter: blur(15px);
    }

    .playlist-info {
      position: absolute;
      width: calc(100% - 30px);
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 15px;

      .author-thumbnail-banner {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;

        &:hover {
          .author-info {
            background-color: var(--bgcolor-alt);
          }
        }

        .author-thumbnail {
          box-shadow: $medium-shadow;
          display: block;
          width: 94px;
        }

        .author-info {
          pointer-events: none;
          transition: width 300ms $intro-easing, opacity 300ms 200ms $intro-easing;
          overflow: hidden;
          margin: 10px 0 0 0;
          padding: 2px 5px;
          border-radius: 5px;
          transition: background-color 200ms $intro-easing;
        }
      }

      .playlist-title {
        margin: 25px 0;
      }

      .playlist-details {
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
        text-align: left;
        display: flex;
        flex-wrap: wrap;

        .playlist-detail {
          margin: 0 20px 0 0;
          .material-design-icon {
            top: 6px;
            margin: 0 5px 0 0;
          }
        }
      }
    }
  }

  .playlist-content-container {
    background-color: var(--bgcolor-main);
    width: calc(100% - 30px);
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0 15px;

    .playlist-description {
      z-index: 10;
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
      padding: 15px 0;
      overflow: hidden;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      font-family: $default-font;
    }

    .playlist-videos-container {
      @include viewtube-grid;
    }

    .load-more-btn {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 0 20px 0;
    }
  }
}
</style>
