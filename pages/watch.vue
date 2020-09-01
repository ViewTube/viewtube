<template>
  <div class="watch">
    <video v-if="!jsEnabled" controls :src="getHDUrl()" class="nojs-player" />
    <VideoPlayer
      v-if="jsEnabled"
      :key="video.id"
      :video="video"
      class="video-player-p"
    />
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
        <h1 class="video-infobox-title">{{ video.title }}</h1>
        <div
          v-if="video.viewCount && video.likeCount && video.dislikeCount"
          class="video-infobox-stats"
        >
          <p class="infobox-views">
            {{ parseFloat(video.viewCount).toLocaleString('en-US') }} views
          </p>
          <div class="infobox-rating">
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
                  width:
                    (video.likeCount / (video.dislikeCount + video.likeCount)) *
                      100 +
                    '%'
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
                  v-if="
                    video.authorThumbnails && video.authorThumbnails.length > 0
                  "
                  id="channel-img"
                  alt="Channel image"
                  :src="video.authorThumbnails[2].url"
                />
              </nuxt-link>
            </div>
            <div class="infobox-channel-info">
              <nuxt-link
                :to="`channel/${video.authorId}`"
                class="infobox-channel-name ripple"
                >{{ video.author }}</nuxt-link
              >
              <p v-if="video.subCount" class="infobox-channel-subcount">
                {{ video.subCount.toLocaleString('en-US') }} subscribers
              </p>
              <p
                v-if="!video.subCount && video.subCountText"
                class="infobox-channel-subcount"
              >
                {{ video.subCountText }} subscribers
              </p>
            </div>
          </div>
          <SubscribeButton
            class="subscribe-button-watch"
            :channel-id="video.authorId"
          />
        </div>
        <div class="video-infobox-date" v-if="video.publishedText">
          {{ video.publishedText }}
        </div>
        <div class="video-exact-date" v-if="!video.publishedText">
          {{ new Date(video.published).toLocaleString('en-US') }}
        </div>
        <div class="video-actions">
          <BadgeButton
            :href="`https://getpocket.com/save?url=${encodedUrl}`"
            style="color: #EF4056;"
          >
            <img src="@/assets/icons/pocket.svg" alt="Save to pocket icon" />
            Save to pocket
          </BadgeButton>

          <BadgeButton
          style="color: #EFBB00">
            <Share
              class="share-icon"
              />
            Share
          </BadgeButton>
        </div>
        <transition>
          <div v-show="shareOpen">
          <div>
            <ShareOptions
                class="share-options-display">
            </ShareOptions>
          </div>
        </div>
        </transition>
        <p class="video-infobox-text">tags:</p>
        <div class="video-infobox-tags">
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
          <div v-create-links class="video-infobox-description links">
            {{ video.description }}
          </div>
          <Spinner v-if="commentsLoading" />
          <div v-if="!commentsLoading" class="comments-container">
            <div class="comments-count">
              <p>
                {{
                  comment.commentCount &&
                    comment.commentCount.toLocaleString('en-US')
                }}
                comments
              </p>
            </div>
            <Comment
              v-for="(comment, i) in comment.comments"
              :key="i"
              :comment="comment"
              :creator-name="video.author"
            />
            <BadgeButton
              v-if="commentsContinuationLink"
              :click="loadMoreComments"
              :loading="commentsContinuationLoading"
            >
              <LoadMoreIcon />
              <p>show more</p>
            </BadgeButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ThumbsUp from 'vue-material-design-icons/ThumbUp'
import ThumbsDown from 'vue-material-design-icons/ThumbDown'
import Share from 'vue-material-design-icons/Share'
import LoadMoreIcon from 'vue-material-design-icons/Reload'
import Spinner from '@/components/Spinner'
import Commons from '@/plugins/commons.js'
import VideoPlayer from '@/components/videoplayer/VideoPlayer'
import SubscribeButton from '@/components/buttons/SubscribeButton'
import Comment from '@/components/Comment'
// import Invidious from '@/plugins/services/invidious'
import ViewtubeApi from '@/plugins/services/viewtubeApi'
import Invidious from '@/plugins/services/invidious'
import RecommendedVideos from '@/components/watch/RecommendedVideos'
import ShareOptions from '@/components/watch/ShareOptions'
import CollapsibleSection from '@/components/list/CollapsibleSection'
import BadgeButton from '@/components/buttons/BadgeButton'

export default {
  name: 'Watch',
  components: {
    Spinner,
    ThumbsUp,
    ThumbsDown,
    Share,
    LoadMoreIcon,
    VideoPlayer,
    SubscribeButton,
    Comment,
    RecommendedVideos,
    ShareOptions,
    CollapsibleSection,
    BadgeButton
  },
  watchQuery(newQuery, oldQuery) {
    const videoId = newQuery.v
    if (this) {
      this.loadComments(videoId)
      this.$store.commit('miniplayer/setCurrentVideo', this.video)
    }
    return true
  },
  asyncData({ query, error }) {
    return Invidious.api
      .videos({
        id: query.v
      })
      .then(response => {
        if (response) {
          return { video: response.data }
        } else {
          // throw new Error('Error loading video')
        }
      })
      .catch(err => {
        if (err.response) {
          error({
            statusCode: err.statusCode,
            message: err.response.data.message
          })
        } else if (err.message) {
          console.log(err.message)
          error({
            statusCode: '500',
            message: 'Error loading video' + err.message,
            detail: JSON.stringify(err)
          })
        }
      })
  },
  data: () => ({
    jsEnabled: false,
    video: [],
    comment: null,
    commentsLoading: true,
    commentsContinuationLink: null,
    commentsContinuationLoading: false,
    commons: Commons,
    recommendedOpen: false,
    shareOpen: true
  }),
  computed: {
    browser() {
      return process.browser
    },
    encodedUrl() {
      if (process.browser) {
        return encodeURIComponent(window.location.href)
      } else {
        return ''
      }
    }
  },
  mounted() {
    if (process.browser) {
      this.jsEnabled = true
    }
    if (window && window.innerWidth > 700) {
      this.recommendedOpen = true
    }
    this.loadComments()
    this.$store.commit('miniplayer/setCurrentVideo', this.video)
  },
  methods: {
    getHDUrl() {
      if (this.video.formatStreams) {
        const video = this.video.formatStreams.find(e => {
          return e.qualityLabel && e.qualityLabel === '720p'
        })
        if (video) {
          return video.url
        } else if (this.video.formatStreams.length > 0) {
          return this.video.formatStreams[0].url
        }
      }
      return '#'
    },
    loadComments(evtVideoId) {
      const videoId = evtVideoId || this.$route.query.v
      fetch(`${Commons.getApiUrl()}comments/${videoId}`, {
        cache: 'force-cache',
        method: 'GET'
      })
        .then(response => response.json())
        .then(data => {
          if (data.comments && data.comments.length > 0) {
            this.comment = data
            this.commentsLoading = false
            this.commentsContinuationLink = data.continuation || null
          }
        })
        .catch(error => {
          console.error(error)
        })
    },
    loadMoreComments() {
      this.commentsContinuationLoading = true
      const videoId = this.$route.query.v
      fetch(
        `${Commons.getApiUrl()}comments/${videoId}?continuation=${
          this.commentsContinuationLink
        }`,
        {
          cache: 'force-cache',
          method: 'GET'
        }
      )
        .then(response => response.json())
        .then(data => {
          this.comment.comments = this.comment.comments.concat(data.comments)
          this.commentsContinuationLoading = false
          this.commentsContinuationLink = data.continuation || null
        })
        .catch(error => {
          console.error(error)
        })
    }
  },
  head() {
    return {
      title: `${this.video.title} - ${this.video.author} - ViewTube`,
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
          content: this.video.formatStreams
            ? this.video.formatStreams[0].url
            : '#'
        }
      ]
    }
  }
}
</script>

<style lang="scss">
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
      padding: 10px 0 0 0;
      width: 100%;

      @media screen and (min-width: $mobile-width) {
        width: 340px;
      }
    }

    .video-infobox {
      width: 100%;
      display: flex;
      flex-direction: column;
      padding: 10px;
      box-sizing: border-box;
      opacity: 1;
      transition: opacity 300ms $intro-easing;
      z-index: 400;
      position: relative;
      width: 100%;

      @media screen and (min-width: $mobile-width) {
        width: calc(100% - 340px);
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
