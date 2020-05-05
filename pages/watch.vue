<template>
  <div class="watch">
    <video
      controls
      v-if="!jsEnabled"
      :src="getHDUrl()"
      class="nojs-player"
    ></video>
    <VideoPlayer
      :key="video.id"
      :video="video"
      class="video-player-p"
      v-if="jsEnabled"
    ></VideoPlayer>
    <div class="video-meta">
      <CollapsibleSection
        class="recommended-videos mobile"
        :label="'Recommended videos'"
      >
        <RecommendedVideos
          class="recommended-videos-list"
          :recommendedVideos="video.recommendedVideos"
        />
      </CollapsibleSection>
      <div class="video-infobox">
        <h1 class="video-infobox-title">{{ video.title }}</h1>
        <div class="video-infobox-stats">
          <p class="infobox-views">{{ parseFloat(video.viewCount).toLocaleString() }} views</p>
          <div class="infobox-rating">
            <div class="infobox-likecount">
              <div class="infobox-likes">
                <ThumbsUp class="thumbs-icon"></ThumbsUp>
                <p class="like-count">{{ parseFloat(video.likeCount).toLocaleString() }}</p>
              </div>
              <div class="infobox-dislikes">
                <ThumbsDown class="thumbs-icon"></ThumbsDown>
                <p class="dislike-count">{{ parseFloat(video.dislikeCount).toLocaleString() }}</p>
              </div>
            </div>
            <div class="like-ratio">
              <div
                class="like-ratio-bar"
                :style="{ width: (video.likeCount / (video.dislikeCount + video.likeCount)) * 100 + '%' }"
              ></div>
            </div>
          </div>
        </div>
        <div class="video-infobox-channel">
          <div class="infobox-channel">
            <div class="infobox-channel-image">
              <nuxt-link :to="`channel/${video.authorId}`">
                <img
                  id="channel-img"
                  alt="channel image"
                  v-if="video.authorThumbnails"
                  :src="video.authorThumbnails[2].url"
                />
              </nuxt-link>
            </div>
            <div class="infobox-channel-info">
              <nuxt-link
                :to="`channel/${video.authorId}`"
                class="infobox-channel-name ripple"
              >{{ video.author }}</nuxt-link>
              <p class="infobox-channel-subcount">{{ video.subCountText }} Subscribers</p>
            </div>
          </div>
          <SubscribeButton
            class="subscribe-button-watch"
            :channelId="video.authorId"
          />
        </div>
        <div class="video-infobox-date">{{ video.publishedText }}</div>
        <div class="video-actions">
          <BadgeButton
            :href="`https://getpocket.com/save?url=${encodedUrl}`"
            style="color: #EF4056;"
          >
            <img src="@/assets/icons/pocket.svg">
            Save to pocket
          </BadgeButton>
        </div>
        <p class="video-infobox-text">tags:</p>
        <div class="video-infobox-tags">
          <div
            class="tags-container"
            v-if="video.keywords"
          >
            <BadgeButton
              class="video-infobox-tag"
              :href="`results?search_query=${keyword}`"
              v-for="keyword in video.keywords"
              :key="keyword"
            >
              <p>{{ keyword }}</p>
            </BadgeButton>
          </div>
        </div>
        <div class="comments-description">
          <div
            class="video-infobox-description links"
            v-html="video.descriptionHtml"
            v-clean-links
          ></div>
          <Spinner v-if="commentsLoading"></Spinner>
          <div
            class="comments-container"
            v-if="!commentsLoading"
          >
            <div class="comments-count">
              <p>{{ comment.commentCount && comment.commentCount.toLocaleString() }} comments</p>
            </div>
            <Comment
              v-for="(comment, i) in comment.comments"
              :comment="comment"
              :key="i"
              :creatorName="video.author"
            />
            <BadgeButton
              :click="loadMoreComments"
              :key="keyword"
              :loading="commentsContinuationLoading"
              v-if="commentsContinuationLink"
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
import Commons from '@/plugins/commons.js'
import Spinner from '@/components/Spinner'
import ThumbsUp from 'vue-material-design-icons/ThumbUp'
import ThumbsDown from 'vue-material-design-icons/ThumbDown'
import LoadMoreIcon from 'vue-material-design-icons/Reload'
import VideoPlayer from '@/components/videoplayer/VideoPlayer'
import SubscribeButton from '@/components/buttons/SubscribeButton'
import Comment from '@/components/Comment'
// import Invidious from '@/plugins/services/invidious'
import ViewtubeApi from '@/plugins/services/viewtubeApi'
import RecommendedVideos from '@/components/watch/RecommendedVideos'
import CollapsibleSection from '@/components/list/CollapsibleSection'
import BadgeButton from '@/components/buttons/BadgeButton'

export default {
  name: 'watch',
  components: {
    Spinner,
    ThumbsUp,
    ThumbsDown,
    LoadMoreIcon,
    VideoPlayer,
    SubscribeButton,
    Comment,
    RecommendedVideos,
    CollapsibleSection,
    BadgeButton
  },
  watchQuery(newQuery, oldQuery) {
    console.log(newQuery)
    const videoId = newQuery.v
    if (this) {
      this.loadComments(videoId)
      this.$store.commit('miniplayer/setCurrentVideo', this.video)
    }
    return true
  },
  data: () => ({
    jsEnabled: false,
    video: [],
    comment: null,
    commentsLoading: true,
    commentsContinuationLink: null,
    commentsContinuationLoading: false,
    commons: Commons
  }),
  head() {
    return {
      title: `${this.video.title} - ${this.video.author} - ViewTube`,
      meta: [
        { hid: 'description', vmid: 'descriptionMeta', name: 'description', content: this.video.description.substring(0, 100) },
        { hid: 'ogTitle', property: 'og:title', content: `${this.video.title} - ${this.video.author} - ViewTube` },
        { hid: 'ogImage', property: 'og:image', itemprop: 'image', content: this.video.videoThumbnails[2].url },
        { hid: 'ogDescription', property: 'og:description', content: this.video.description.substring(0, 100) },
        { property: 'og:video', content: this.video.formatStreams[0].url }
      ]
    }
  },
  mounted() {
    if (process.browser) {
      this.jsEnabled = true
    }
    this.loadComments()
    this.$store.commit('miniplayer/setCurrentVideo', this.video)
  },
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
  asyncData({ query }) {
    return ViewtubeApi.api.videos({
      id: query.v
    }).then(response => {
      if (response) {
        return { video: response.data }
      } else {
        throw new Error('Error loading video')
      }
    })
      .catch(error => {
        console.error(error)
      })
  },
  methods: {
    getHDUrl() {
      const { url } = this.video.formatStreams.find(e => {
        return e.qualityLabel && e.qualityLabel === '720p'
      })
      return url ?? this.video.formatStreams[0].src
    },
    async loadComments(evtVideoId) {
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
      fetch(`${Commons.getApiUrl()}comments/${videoId}?continuation=${this.commentsContinuationLink}`, {
        cache: 'force-cache',
        method: 'GET'
      })
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
  }
}
</script>

<style lang="scss">
.watch {
  overflow-y: scroll;
  overflow-x: hidden;
  padding-top: $header-height;
  perspective: 4px;
  perspective-origin: 0 0;
  height: calc(100% - #{$header-height});
  position: relative;

  .nojs-player {
    transform-origin: 0 0;
    max-height: calc(100vh - 170px);
    transform: translate3d(0, $header-height, -4px) scale(2);
    z-index: 11;
    width: 100%;
  }

  .video-player-p {
    transform-origin: 0 0;
    transform: translate3d(0, $header-height, -4px) scale(2);
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
      content: "";
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
        overflow-x: scroll;
        padding: 0 0 0 $tag-padding-left;
        scrollbar-width: none;
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
        margin: 20px auto 10px auto;
        width: 100%;
      }

      .video-actions {
        margin: 0 auto;
        width: 100%;

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
