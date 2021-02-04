<template>
  <div class="watch">
    <!-- <video v-if="!jsEnabled" controls :src="getHDUrl()" class="nojs-player" /> -->
    <VideoPlayer :key="video.id" ref="videoplayer" :video="video" class="video-player-p" />
    <div class="video-meta">
      <CollapsibleSection
        class="recommended-videos mobile"
        :label="'Recommended videos'"
        :opened="recommendedOpen"
      >
        <RecommendedVideos
          class="recommended-videos-list"
          :recommended-videos="video.recommendedVideos"
        />
      </CollapsibleSection>
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
                  :src="video.authorThumbnails[2].url"
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
        <div v-if="video.publishedText" class="video-infobox-date">
          {{ video.publishedText }}
        </div>
        <div v-if="!video.publishedText" class="video-exact-date">
          {{ new Date(video.published).toLocaleString('en-US') }}
        </div>
        <div class="video-actions">
          <BadgeButton
            :href="`https://getpocket.com/save?url=${encodedUrl}`"
            style="color: #ef4056"
          >
            <img src="@/assets/icons/pocket.svg" alt="Save to pocket icon" />
            Save to pocket
          </BadgeButton>
          <BadgeButton style="color: #efbb00" :click="() => (shareOpen = !shareOpen)">
            <Share class="share-icon" />
            Share
          </BadgeButton>
        </div>
        <transition name="share-fade-down">
          <div v-show="shareOpen">
            <div>
              <ShareOptions class="share-options-display" />
            </div>
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
          <div v-if="commentsError" class="comments-error">
            <p>Error loading comments. Try changing the invidious instance.</p>
          </div>
          <div v-if="!commentsLoading && comment" class="comments-container">
            <div class="comments-count">
              <p>
                {{ comment.commentCount && comment.commentCount.toLocaleString('en-US') }}
                comments
              </p>
            </div>
            <Comment
              v-for="(subComment, i) in comment.comments"
              :key="i"
              :comment="subComment"
              :creator-name="video.author"
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
import Spinner from '@/components/Spinner.vue';
import SubscribeButton from '@/components/buttons/SubscribeButton.vue';
import Comment from '@/components/Comment.vue';
import RecommendedVideos from '@/components/watch/RecommendedVideos.vue';
import ShareOptions from '@/components/watch/ShareOptions.vue';
import CollapsibleSection from '@/components/list/CollapsibleSection.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import Vue from 'vue';
import ViewTubeApi from '@/plugins/services/viewTubeApi.ts';

export default Vue.extend({
  name: 'Watch',
  components: {
    Spinner,
    ThumbsUp,
    ThumbsDown,
    Share,
    LoadMoreIcon,
    VideoPlayer: () =>
      import(
        /* webpackChunkName: "group-videoplayer" */ '@/components/videoplayer/VideoPlayer.vue'
      ),
    SubscribeButton,
    Comment,
    RecommendedVideos,
    ShareOptions,
    CollapsibleSection,
    BadgeButton
  },
  asyncData({ store, query, error }) {
    const viewTubeApi = new ViewTubeApi(store.getters['environment/apiUrl']);
    return viewTubeApi.api
      .videos({
        id: query.v
      })
      .then(response => {
        if (response) {
          return { video: response.data };
        } else {
          this.$store.dispatch('messages/createMessage', {
            type: 'error',
            title: 'Error loading video',
            message: 'Loading video information failed. Try reloading the page.'
          });
        }
      })
      .catch((err: any) => {
        const errorObj = err || {
          message: 'Error loading video'
        };
        error({
          statusCode: 500,
          message: errorObj.message,
          detail: errorObj
        } as any);
      });
  },
  data() {
    return {
      jsEnabled: false,
      video: [],
      comment: null,
      commentsLoading: true,
      commentsError: false,
      commentsContinuationLink: null,
      commentsContinuationLoading: false,
      recommendedOpen: false,
      shareOpen: false
    };
  },
  head() {
    return {
      title: `${this.video.title} :: ${this.video.author} :: ViewTube`,
      meta: [
        {
          hid: 'description',
          vmid: 'descriptionMeta',
          name: 'description',
          content: this.video.description.substring(0, 100)
        },
        {
          hid: 'ogTitle',
          property: 'og:title',
          content: `${this.video.title} - ${this.video.author} - ViewTube`
        },
        {
          hid: 'ogImage',
          property: 'og:image',
          itemprop: 'image',
          content: this.video.videoThumbnails[2].url
        },
        {
          hid: 'ogDescription',
          property: 'og:description',
          content: this.video.description.substring(0, 100)
        },
        {
          property: 'og:video',
          content: this.video.formatStreams ? this.video.formatStreams[0].url : '#'
        }
      ]
    };
  },
  computed: {
    browser() {
      return process.browser;
    },
    encodedUrl() {
      if (process.browser) {
        return encodeURIComponent(window.location.href);
      } else {
        return '';
      }
    }
  },
  watchQuery(newQuery: any) {
    const videoId = newQuery.v;
    if (this) {
      this.loadComments(videoId);
      this.$store.commit('miniplayer/setCurrentVideo', this.video);
    }
    return true;
  },
  mounted() {
    if (process.browser) {
      this.jsEnabled = true;
    }
    if (window && window.innerWidth > 700) {
      this.recommendedOpen = true;
    }
    this.loadComments();
    this.$store.commit('miniplayer/setCurrentVideo', this.video);
  },
  methods: {
    setTimestamp(e: any, seconds: number) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('t', `${seconds}s`);
      this.$router.push(`${location.pathname}?${searchParams.toString()}`);
      this.$refs.videoplayer.setVideoTime(seconds);
      e.preventDefault();
    },
    getHDUrl() {
      if (this.video.formatStreams) {
        const video = this.video.formatStreams.find(e => {
          return e.qualityLabel && e.qualityLabel === '720p';
        });
        if (video) {
          return video.url;
        } else if (this.video.formatStreams.length > 0) {
          return this.video.formatStreams[0].url;
        }
      }
      return '#';
    },
    loadComments(evtVideoId: string) {
      const videoId = evtVideoId || this.$route.query.v;
      fetch(`${this.$store.getters['instances/currentInstanceApiV1']}comments/${videoId}`, {
        cache: 'force-cache',
        method: 'GET'
      })
        .then(response => response.json())
        .then(data => {
          if (data.comments && data.comments.length > 0) {
            this.comment = data;
            this.commentsLoading = false;
            this.commentsContinuationLink = data.continuation || null;
          } else {
            this.commentsLoading = false;
            this.commentsError = true;
            this.comment = null;
          }
        })
        .catch(_ => {
          this.commentsLoading = false;
          this.commentsError = true;
          this.comment = null;
        });
    },
    loadMoreComments() {
      this.commentsContinuationLoading = true;
      const videoId = this.$route.query.v;
      fetch(
        `${this.$store.getters['instances/currentInstanceApiV1']}comments/${videoId}?continuation=${this.commentsContinuationLink}`,
        {
          cache: 'force-cache',
          method: 'GET'
        }
      )
        .then(response => response.json())
        .then(data => {
          this.comment.comments = this.comment.comments.concat(data.comments);
          this.commentsContinuationLoading = false;
          this.commentsContinuationLink = data.continuation || null;
        })
        .catch(_ => {
          this.$store.dispatch('messages/createMessage', {
            type: 'error',
            title: 'Error loading more comments',
            message: 'Loading comments failed. There may not be any more comments.'
          });
        });
    }
  }
});
</script>

<style lang="scss">
.share-fade-down-enter-active,
.share-fade-down-leave-active {
  transition: transform 200ms $intro-easing, opacity 200ms $intro-easing;
}
.share-fade-down-enter-to,
.share-fade-down-leave {
  transform: scale(1);
  opacity: 1;
}
.share-fade-down-enter,
.share-fade-down-leave-to {
  transform: scale(1.1);
  opacity: 0;
}

.watch {
  width: 100%;
  margin-top: $header-height;

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
