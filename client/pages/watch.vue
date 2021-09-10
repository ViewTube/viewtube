<template>
  <div class="watch">
    <VideoLoadingTemplate
      v-if="$fetchState.pending && templateVideoData"
      :video="templateVideoData"
    />
    <Spinner v-if="$fetchState.pending && !templateVideoData" class="centered" />
    <!-- <video v-if="!jsEnabled" controls :src="getHDUrl()" class="nojs-player" /> -->
    <VideoPlayer
      v-if="video && videoLoaded && !$fetchState.pending"
      :key="video.id"
      ref="videoplayer"
      :video="video"
      :initialVideoTime="initialVideoTime"
      :autoplay="isAutoplaying"
      class="video-player-p"
      @videoEnded="onVideoEnded"
    />
    <div v-if="video && !$fetchState.pending" class="video-meta">
      <div class="recommended-videos mobile">
        <NextUpVideo
          v-if="nextUpVideo && $accessor.settings.autoplayNextVideo"
          :video="nextUpVideo"
        />
        <CollapsibleSection :label="'Recommended videos'" :opened="recommendedOpen">
          <RecommendedVideos
            class="recommended-videos-list"
            :recommended-videos="recommendedVideos"
          />
        </CollapsibleSection>
      </div>
      <div class="video-infobox">
        <h1 class="video-infobox-title">
          {{ video.title }}
        </h1>
        <div class="video-infobox-stats">
          <p v-if="video.viewCount" class="infobox-views">
            {{ parseFloat(video.viewCount).toLocaleString('en-US') }}
            views
          </p>
          <div v-if="video.likeCount && video.dislikeCount" class="infobox-rating">
            <div class="infobox-likecount">
              <div class="infobox-likes">
                <ThumbsUp class="thumbs-icon" />
                <p class="like-count">
                  {{ parseFloat(video.likeCount).toLocaleString('en-US') }}
                </p>
              </div>
              <div class="infobox-dislikes">
                <ThumbsDown class="thumbs-icon" />
                <p class="dislike-count">
                  {{ parseFloat(video.dislikeCount).toLocaleString('en-US') }}
                </p>
              </div>
            </div>
            <div class="like-ratio">
              <div
                class="like-ratio-bar"
                :style="{
                  width: (video.likeCount / (video.dislikeCount + video.likeCount)) * 100 + '%'
                }"
              />
            </div>
          </div>
        </div>
        <div class="video-infobox-channel">
          <div class="infobox-channel">
            <div class="infobox-channel-image">
              <nuxt-link :to="`channel/${video.authorId}`">
                <img
                  v-if="video.authorThumbnails && video.authorThumbnails.length > 0"
                  id="channel-img"
                  alt="Channel image"
                  :src="imgProxyUrl + video.authorThumbnails[2].url"
                />
              </nuxt-link>
            </div>
            <div class="infobox-channel-info">
              <nuxt-link :to="`channel/${video.authorId}`" class="infobox-channel-name ripple">{{
                video.author
              }}</nuxt-link>
              <p v-if="video.subCount" class="infobox-channel-subcount">
                {{ video.subCount.toLocaleString('en-US') }}
                subscribers
              </p>
              <p v-if="!video.subCount && video.subCountText" class="infobox-channel-subcount">
                {{ video.subCountText }} subscribers
              </p>
            </div>
          </div>
          <SubscribeButton class="subscribe-button-watch" :channel-id="video.authorId" />
        </div>
        <PlaylistSection
          v-if="playlist"
          ref="playlistSectionRef"
          :playlist="playlist"
          :currentVideoId="video.videoId"
        />
        <div v-if="video.publishedText" class="video-infobox-date">
          {{ video.publishedText }}
        </div>
        <div v-if="!video.publishedText" class="video-exact-date">
          {{ new Date(video.published).toLocaleString('en-US') }}
        </div>
        <div class="video-actions">
          <BadgeButton style="color: #efbb00" :click="() => (shareOpen = !shareOpen)">
            <Share class="share-icon" />
            Share
          </BadgeButton>
        </div>
        <transition name="share-fade-down">
          <div v-show="shareOpen">
            <ShareOptions class="share-options-display" />
          </div>
        </transition>
        <p v-if="video.keywords" class="video-infobox-text">Tags</p>
        <div v-if="video.keywords" class="video-infobox-tags">
          <div v-if="video.keywords" class="tags-container">
            <BadgeButton
              v-for="keyword in video.keywords"
              :key="keyword"
              class="video-infobox-tag"
              :href="`results?search_query=${keyword}`"
            >
              <p>{{ keyword }}</p>
            </BadgeButton>
          </div>
        </div>
        <div class="comments-description">
          <div
            v-create-links
            v-create-timestamp-links="setTimestamp"
            class="video-infobox-description links"
          >
            {{ video.description }}
          </div>
          <Spinner v-if="commentsLoading" />
          <div v-if="video.liveNow" class="comments-error livestream">
            <p>Livestream comments are not supported yet.</p>
          </div>
          <div v-if="commentsError" class="comments-error">
            <p>Error loading comments. They might be disabled for this video.</p>
            <BadgeButton :click="reloadComments" :loading="commentsLoading"
              ><LoadMoreIcon />Try again</BadgeButton
            >
          </div>
          <div v-if="!commentsLoading && comment" class="comments-container">
            <Comment
              v-for="(subComment, i) in comment.comments"
              :key="i"
              :comment="subComment"
              :channelAuthorId="video.authorId"
              :channelAuthorName="video.author"
            />
            <BadgeButton
              v-if="commentsContinuationLink"
              :click="loadMoreComments"
              :loading="commentsContinuationLoading"
            >
              <LoadMoreIcon />
              <p>Show more</p>
            </BadgeButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ThumbsUp from 'vue-material-design-icons/ThumbUp.vue';
import ThumbsDown from 'vue-material-design-icons/ThumbDown.vue';
import Share from 'vue-material-design-icons/Share.vue';
import LoadMoreIcon from 'vue-material-design-icons/Reload.vue';
import {
  defineComponent,
  onMounted,
  Ref,
  ref,
  useContext,
  useFetch,
  useMeta,
  useRoute,
  useRouter,
  watch
} from '@nuxtjs/composition-api';
import { Result } from 'ytpl';
import NextUpVideo from '@/components/watch/NextUpVideo.vue';
import Spinner from '@/components/Spinner.vue';
import SubscribeButton from '@/components/buttons/SubscribeButton.vue';
import Comment from '@/components/Comment.vue';
import RecommendedVideos from '@/components/watch/RecommendedVideos.vue';
import ShareOptions from '@/components/watch/ShareOptions.vue';
import CollapsibleSection from '@/components/list/CollapsibleSection.vue';
import PlaylistSection from '@/components/watch/PlaylistSection.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import ViewTubeApi from '@/plugins/services/viewTubeApi';
import { createComputed } from '@/plugins/computed';
import { useAccessor } from '@/store';
import { useAxios } from '@/plugins/axiosPlugin';
import { useImgProxy } from '@/plugins/proxy';
import VideoLoadingTemplate from '@/components/watch/VideoLoadingTemplate.vue';

export default defineComponent({
  name: 'Watch',
  components: {
    Spinner,
    ThumbsUp,
    ThumbsDown,
    Share,
    LoadMoreIcon,
    NextUpVideo,
    VideoPlayer: () =>
      import(
        /* webpackChunkName: "group-videoplayer" */ '@/components/videoplayer/VideoPlayer.vue'
      ),
    SubscribeButton,
    Comment,
    RecommendedVideos,
    ShareOptions,
    CollapsibleSection,
    BadgeButton,
    VideoLoadingTemplate,
    PlaylistSection
  },
  setup() {
    const accessor = useAccessor();
    const route = useRoute();
    const router = useRouter();
    const { error } = useContext();
    const axios = useAxios();
    const imgProxy = useImgProxy();

    const jsEnabled = ref(false);
    const video = ref(null);
    const comment = ref(null);
    const commentsLoading = ref(true);
    const commentsError = ref(false);
    const commentsContinuationLink = ref(null);
    const commentsContinuationLoading = ref(false);
    const recommendedOpen = ref(false);
    const shareOpen = ref(false);
    const videoplayerRef = ref(null);
    const playlistSectionRef = ref(null);
    const initialVideoTime = ref(0);
    const videoLoaded = ref(false);

    const playlist: Ref<Result> = ref(null);

    const templateVideoData = route.value.params.videoData;

    const isPlaylist = createComputed(() => {
      return Boolean(route.value.query && route.value.query.list);
    });

    const isAutoplaying = createComputed(() => {
      return (
        isPlaylist.value || accessor.settings.autoplay || route.value.query.autoplay === 'true'
      );
    });

    const recommendedVideos = createComputed(() => {
      if (video.value) {
        if (accessor.settings.autoplayNextVideo) {
          return video.value.recommendedVideos.slice(1);
        }
        return video.value.recommendedVideos;
      }
      return [];
    });

    const nextUpVideo = createComputed(() => {
      if (video.value) return video.value.recommendedVideos[0];
      return null;
    });
    const saveToHistory = () => {
      if (accessor.user.isLoggedIn) {
        const apiUrl = accessor.environment.apiUrl;
        axios
          .post(
            `${apiUrl}user/history/${video.value.videoId}`,
            {
              progressSeconds: null,
              lengthSeconds: video.value.lengthSeconds
            },
            { withCredentials: true }
          )
          .catch(_ => {});
      }
    };
    const reloadComments = () => {
      commentsLoading.value = true;
      commentsError.value = false;
      loadComments();
    };
    const setTimestamp = (e: any, seconds: number) => {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('t', `${seconds}s`);
      router.push(`${location.pathname}?${searchParams.toString()}`);
      videoplayerRef.setVideoTime(seconds);
      e.preventDefault();
    };
    const getHDUrl = () => {
      if (video.value.legacyFormats) {
        const hdVideo = video.value.legacyFormats.find((e: { qualityLabel: string }) => {
          return e.qualityLabel && e.qualityLabel === '720p';
        });
        if (hdVideo) {
          return hdVideo.url;
        } else if (video.value.legacyFormats.length > 0) {
          return video.value.legacyFormats[0].url;
        }
      }
      return '#';
    };
    const loadComments = (evtVideoId: string = null) => {
      const videoId = evtVideoId || route.value.query.v;
      axios
        .get(`${accessor.environment.apiUrl}comments/${videoId}`)
        .then(response => {
          if (response.data.comments && response.data.comments.length > 0) {
            comment.value = response.data;
            commentsLoading.value = false;
            commentsContinuationLink.value = response.data.continuation || null;
          } else {
            commentsLoading.value = false;
            commentsError.value = true;
            comment.value = null;
          }
        })
        .catch(_ => {
          commentsLoading.value = false;
          commentsError.value = true;
          comment.value = null;
        });
    };
    const loadMoreComments = () => {
      commentsContinuationLoading.value = true;
      const videoId = route.value.query.v;
      axios
        .get(
          `${accessor.environment.apiUrl}comments/${videoId}?continuation=${commentsContinuationLink.value}`
        )
        .then(response => {
          comment.value.comments = comment.value.comments.concat(response.data.comments);
          commentsContinuationLoading.value = false;
          commentsContinuationLink.value = response.data.continuation || null;
        })
        .catch(_ => {
          accessor.messages.createMessage({
            type: 'error',
            title: 'Error loading more comments',
            message: 'Loading comments failed. There may not be any more comments.'
          });
        });
    };

    const loadPlaylist = async () => {
      if (isPlaylist.value) {
        const apiUrl = accessor.environment.apiUrl;
        await axios
          .get(`${apiUrl}playlists`, { params: { playlistId: route.value.query.list } })
          .then(response => {
            if (response.data) {
              playlist.value = response.data;
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
    };

    const { fetch } = useFetch(async (): Promise<void> => {
      videoLoaded.value = false;
      const apiUrl = accessor.environment.apiUrl;
      const viewTubeApi = new ViewTubeApi(apiUrl);
      await viewTubeApi.api
        .videos({
          id: route.value.query.v
        })
        .then(async (response: { data: any }): Promise<void> => {
          if (response) {
            video.value = response.data;
            if (accessor.user.isLoggedIn && accessor.settings.saveVideoHistory) {
              const videoVisit = await axios
                .get<{
                  videoId: string;
                  progressSeconds: number;
                  lengthSeconds: number;
                  lastVisit: Date;
                }>(`${apiUrl}user/history/${response.data.videoId}`, { withCredentials: true })
                .catch((_: any) => {});

              if (videoVisit && videoVisit.data && videoVisit.data.progressSeconds > 0) {
                initialVideoTime.value = videoVisit.data.progressSeconds;
              } else {
                saveToHistory();
              }
            }
            videoLoaded.value = true;
          } else {
            accessor.messages.createMessage({
              type: 'error',
              title: 'Error loading video',
              message: 'Loading video information failed. Refresh the page to try again.',
              dismissDelay: 0
            });
          }
        })
        .catch((err: any) => {
          let errorObj: any = {
            message: 'Error loading video'
          };
          if (err) {
            errorObj = {
              requestConfig: err.config,
              responseData: err.response ? err.response.data : null,
              message: err.message
            };
          }
          error({
            statusCode: 500,
            message:
              errorObj.responseData &&
              errorObj.responseData.message &&
              typeof errorObj.responseData.message === 'string'
                ? errorObj.responseData.message
                : errorObj.message,
            detail: errorObj
          } as any);
        });
    });

    watch(
      () => route.value.query,
      (newValue, oldValue) => {
        if (newValue.v !== oldValue.v || newValue.list !== oldValue.list) {
          fetch();
          const videoId = newValue.v as string;
          loadComments(videoId);
          accessor.miniplayer.setCurrentVideo(video);
        }
      }
    );

    onMounted(() => {
      if (process.browser) {
        jsEnabled.value = true;
      }
      if (window && window.innerWidth > 700) {
        recommendedOpen.value = true;
      }
      loadComments();
      accessor.miniplayer.setCurrentVideo(video);
      loadPlaylist();
    });

    const onVideoEnded = () => {
      if (
        isPlaylist.value &&
        playlistSectionRef.value &&
        !accessor.settings.alwaysLoopVideo &&
        !accessor.videoPlayer.loop
      ) {
        playlistSectionRef.value.playNextVideo();
      } else if (accessor.settings.autoplayNextVideo && video.value.recommendedVideos) {
        router.push({
          path: route.value.fullPath,
          query: { v: video.value.recommendedVideos[0].videoId, autoplay: 'true' }
        });
      }
    };

    useMeta(() => {
      if (video.value) {
        return {
          title: `${video.value.title} :: ${video.value.author} :: ViewTube`,
          meta: [
            {
              hid: 'description',
              vmid: 'descriptionMeta',
              name: 'description',
              content: video.value.description.substring(0, 100)
            },
            {
              hid: 'ogTitle',
              property: 'og:title',
              content: `${video.value.title} - ${video.value.author} - ViewTube`
            },
            {
              hid: 'ogImage',
              property: 'og:image',
              itemprop: 'image',
              content: video.value.videoThumbnails[2].url
            },
            {
              hid: 'ogDescription',
              property: 'og:description',
              content: video.value.description.substring(0, 100)
            },
            {
              property: 'og:video',
              content:
                video.value.legacyFormats && video.value.legacyFormats.length > 0
                  ? video.value.legacyFormats[0].url
                  : '#'
            }
          ]
        };
      }
    });

    return {
      imgProxyUrl: imgProxy.url,
      jsEnabled,
      video,
      comment,
      videoplayerRef,
      playlistSectionRef,
      commentsLoading,
      commentsError,
      commentsContinuationLink,
      commentsContinuationLoading,
      recommendedOpen,
      recommendedVideos,
      nextUpVideo,
      videoLoaded,
      initialVideoTime,
      shareOpen,
      onVideoEnded,
      reloadComments,
      setTimestamp,
      isPlaylist,
      isAutoplaying,
      getHDUrl,
      loadMoreComments,
      templateVideoData,
      playlist
    };
  },
  head: {}
});
</script>

<style lang="scss">
.share-fade-down-enter-active,
.share-fade-down-leave-active {
  transition: transform 200ms $intro-easing, opacity 200ms $intro-easing, height 200ms $intro-easing;
}
.share-fade-down-enter-to,
.share-fade-down-leave {
  transform: translateX(0);
  height: 60px;
  opacity: 1;
}
.share-fade-down-enter,
.share-fade-down-leave-to {
  transform: translateX(40px);
  height: 0;
  opacity: 0;
}

.watch {
  width: 100%;
  margin-top: $header-height;

  .videoplayer-placeholder {
    height: calc(100vh - 170px);
  }

  .nojs-player {
    max-height: calc(100vh - 170px);
    z-index: 11;
    width: 100%;
  }

  .video-player-p {
    z-index: 11;
  }

  .video-meta {
    display: flex;
    flex-direction: row-reverse;
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;

    @media screen and (max-width: $mobile-width) {
      flex-direction: column;
    }

    &::before {
      content: '';
      position: absolute;
      width: 100%;
      left: 0;
      background-color: var(--bgcolor-main);
      height: 100%;
      z-index: 400;
    }

    .recommended-videos {
      background-color: var(--bgcolor-main);
      z-index: 400;
      width: 100%;

      @media screen and (min-width: $mobile-width) {
        width: 340px;
      }
    }

    .video-infobox {
      width: 100%;
      display: flex;
      flex-direction: column;
      padding: 0 10px;
      box-sizing: border-box;
      opacity: 1;
      transition: opacity 300ms $intro-easing;
      z-index: 400;
      position: relative;
      width: 100%;

      @media screen and (min-width: $mobile-width) {
        width: calc(100% - 340px);
        padding: 10px;
      }

      .video-infobox-title {
        color: var(--title-color);
        font-family: $default-font;
        font-size: 1.4rem;
        margin: 10px 0 10px 0;
      }

      .video-infobox-tags {
        $tag-padding-left: calc((100% - #{$main-width}) / 2);
        margin: 5px auto 0 auto;
        width: 100%;
        height: 40px;
        overflow: auto hidden;
        padding: 0 0 0 $tag-padding-left;
        scrollbar-width: thin;
        box-sizing: border-box;
        position: relative;

        .tags-container {
          display: flex;
          flex-direction: row;
          width: auto;
          position: absolute;

          .video-infobox-tag {
            display: inline-block;
            overflow: hidden;
            white-space: nowrap;
          }
        }

        &::-webkit-scrollbar {
          display: none;
        }
      }

      .video-infobox-stats {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin: 0 auto 20px auto;

        .infobox-views {
          color: var(--subtitle-color);
          font-family: $default-font;
          margin: 0 30px 0 0;
          font-size: 1.1rem;
        }

        .infobox-rating {
          .infobox-likecount {
            display: flex;
            flex-direction: row;

            .infobox-likes {
              margin: 0 30px 0 0;
            }

            .infobox-likes,
            .infobox-dislikes {
              color: var(--subtitle-color);
              font-family: $default-font;
              display: flex;
              flex-direction: row;

              .thumbs-icon {
                width: 2rem;
                height: 0.8rem;
              }

              p {
                text-align: center;
              }
            }
          }

          .like-ratio {
            width: 100%;
            height: 2px;
            background-color: var(--theme-color-alt);
            position: relative;
            margin: 10px 0 0 0;

            .like-ratio-bar {
              position: absolute;
              background-image: $theme-color-primary-gradient;
              height: 100%;
            }
          }
        }
      }

      .video-infobox-channel {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin: 0 auto;

        @media screen and (max-width: $watch-break-width) {
          flex-direction: column;
          align-items: flex-start;

          .infobox-channel {
            margin: 0 0 20px 0;
            .infobox-channel-info {
              .infobox-channel-name {
                max-width: 65vw !important;
              }
            }
          }
        }

        .infobox-channel {
          display: flex;
          flex-direction: row;
          align-items: center;

          .infobox-channel-image {
            width: 50px;
            height: 50px;
            margin: 0 10px 0 0;

            img {
              width: 100%;
              height: 100%;
            }
          }

          .infobox-channel-info {
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            flex-wrap: wrap;
            margin: 0 20px 0 0;

            .infobox-channel-name {
              text-decoration: none;
              color: var(--title-color);
              font-family: $default-font;
              font-size: 1.2rem;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 45vw;
            }

            .infobox-channel-subcount {
              color: var(--subtitle-color);
              font-family: $default-font;
            }
          }
        }
      }

      .video-infobox-date {
        margin: 20px 0 0 0;
        width: 100%;
      }

      .video-exact-date {
        margin: 0 0 10px 0;
        color: var(--subtitle-color-light);
      }

      .video-actions {
        margin: 0 auto;
        width: 100%;
        display: flex;
        flex-direction: row;

        img {
          position: relative;
          top: 0;
          left: 4px;
          width: 24px;
          height: 24px;
        }
      }

      .video-infobox-text {
        margin: 0 auto;
        width: 100%;
      }

      .video-infobox-description {
        margin: 10px auto 0 auto;
        color: var(--title-color);
        font-family: $default-font;
        line-height: 1.2rem;
        overflow: hidden;
        white-space: pre-wrap;
        overflow-wrap: break-word;
        width: 100%;

        .favicon-link {
          height: 13px;
          margin: 0 4px;
        }
      }

      .comments-error {
        margin: 50px 0 0 0;
        color: var(--error-color-red);
      }

      .comments-container {
        width: 100%;
        margin: 20px auto 0 auto;
      }

      &.loading {
        opacity: 0;
      }
    }
  }
}
</style>
