<template>
  <div class="watch">
    <vue-headful
      :title="(video.title !== undefined ? `${video.title} - ${video.author}` : 'loading') + ' - ViewTube'"
      :keywords="video.keywords !== undefined ? video.keywords.toString(): ''"
      :description="commons.description"
      :image="(video.videoThumbnails !== undefined ? video.videoThumbnails[0].url : '#')"
      lang="en"
    />
    <VideoPlayer v-if="!loading" :key="video.id" :video="video" class="video-player-p"></VideoPlayer>
    <div class="video-infobox" v-if="!loading">
      <h1 class="video-infobox-title">{{ video.title }}</h1>
      <div class="video-infobox-stats">
        <p class="infobox-views">{{ video.viewCount.toLocaleString() }} views</p>
        <div class="infobox-rating">
          <div class="infobox-likecount">
            <div class="infobox-likes">
              <ThumbsUp class="thumbs-icon"></ThumbsUp>
              <p class="like-count">{{ video.likeCount.toLocaleString() }}</p>
            </div>
            <div class="infobox-dislikes">
              <ThumbsDown class="thumbs-icon"></ThumbsDown>
              <p class="dislike-count">{{ video.dislikeCount.toLocaleString() }}</p>
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
            <router-link :to="`channel/${video.authorId}`">
              <img id="channel-img" alt="channel image" :src="video.authorThumbnails[2].url" />
            </router-link>
          </div>
          <div class="infobox-channel-info">
            <router-link
              :to="`channel/${video.authorId}`"
              class="infobox-channel-name ripple"
            >{{ video.author }}</router-link>
            <p class="infobox-channel-subcount">{{ video.subCountText }} Subscribers</p>
          </div>
        </div>
        <SubscribeButton class="subscribe-button-watch" :channelId="video.authorId" />
      </div>
      <div class="video-infobox-date">{{ video.publishedText }}</div>
      <div class="video-actions">
        <a :href="`https://getpocket.com/save?url=${encodedUrl}`" target="_blank" style="color: #EF4056;">
          <img src="@/assets/icons/pocket.svg" />Save to pocket
        </a>
      </div>
      <p class="video-infobox-text">tags:</p>
      <div class="video-infobox-tags">
        <router-link
          class="video-infobox-tag badge-btn"
          v-for="keyword in video.keywords"
          :key="keyword"
          :to="`results?search_query=${keyword}`"
          target="_blank"
          v-ripple
        >{{ keyword }}</router-link>
      </div>
      <div class="comments-description">
        <div class="video-infobox-description links" v-html="video.descriptionHtml" v-clean-links></div>
        <Spinner v-if="commentsLoading"></Spinner>
        <div class="comments-container" v-if="!commentsLoading">
          <div class="comments-count">
            <p>{{ comment.commentCount.toLocaleString() }} comments</p>
          </div>
          <Comment
            v-for="(comment, i) in comment.comments"
            :comment="comment"
            :key="i"
            :creatorName="video.author"
          />
          <a
            class="badge-btn"
            href="#"
            @click.prevent="loadMoreComments"
            v-if="commentsContinuationLink && !commentsContinuationLoading"
          >show more</a>
          <Spinner v-if="commentsContinuationLoading"></Spinner>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Commons from '@/commons.js'
import Spinner from '@/components/Spinner'
import ThumbsUp from 'icons/ThumbUp'
import ThumbsDown from 'icons/ThumbDown'
import VideoPlayer from '@/components/videoplayer/VideoPlayer'
import SubscribeButton from '@/components/buttons/SubscribeButton'
import Comment from '@/components/Comment'

export default {
  name: 'watch',
  components: {
    Spinner,
    ThumbsUp,
    ThumbsDown,
    VideoPlayer,
    SubscribeButton,
    Comment
  },
  data: () => ({
    video: [],
    comment: null,
    loading: true,
    commentsLoading: true,
    commentsContinuationLink: null,
    commentsContinuationLoading: false,
    commons: Commons
  }),
  computed: {
    encodedUrl() {
      return encodeURIComponent(window.location.href)
    }
  },
  beforeRouteEnter(to, from, next) {
    window.invidious.api.videos({
      id: to.query.v
    }).then(response => next(vm => vm.loadData(response.data)))
      .catch(error => {
        console.error(error)
        next(vm => vm.$Progress.fail())
      })
  },
  beforeRouteUpdate(to, from, next) {
    this.$Progress.start()
    const videoId = to.query.v
    fetch(`${Commons.getApiUrl()}videos/${videoId}`, {
      cache: 'force-cache',
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        this.loadData(data)
        next()
      })
      .catch(error => {
        console.error(error)
        this.$Progress.fail()
        next()
      })
  },
  beforeRouteLeave(to, from, next) {
    next()
  },
  methods: {
    loadData(data) {
      this.video = data
      this.loading = false
      this.loadComments()
      this.$Progress.finish()
      this.$store.commit('miniplayer/setCurrentVideo', this.video)
    },
    async loadComments() {
      const videoId = this.$route.query.v
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
  margin-top: $header-height;
  overflow-x: hidden;
  overflow-y: scroll;
  perspective: 4px;
  perspective-origin: 0 0;
  height: calc(100% - #{$header-height});
  margin-top: $header-height;

  .video-player-p {
    transform-origin: 0 0;
    transform: translateZ(-4px) scale(2);
    z-index: 11;
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
    background-color: var(--bgcolor-main);

    .video-infobox-title {
      color: var(--title-color);
      font-family: $default-font;
      font-size: 1.4rem;
      max-width: $main-width;
      width: 100%;
      margin: 20px auto 10px auto;
    }

    .video-infobox-tags {
      $tag-padding-left: calc((100% - #{$main-width}) / 2);
      margin: 5px auto 0 auto;
      width: 100%;
      height: 40px;
      overflow: hidden;
      overflow-x: auto;
      white-space: nowrap;
      padding: 0 0 0 $tag-padding-left;
      scrollbar-width: none;
      box-sizing: border-box;

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
      max-width: $main-width;

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
      max-width: $main-width;
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
      max-width: $main-width;
      width: 100%;
    }

    .video-actions{
      img{
        position: relative;
        top: 6px;
        left: 2px;
      }
    }

    .video-infobox-text {
      margin: 0 auto;
      max-width: $main-width;
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
      max-width: $main-width;
      width: 100%;

      .favicon-link {
        height: 13px;
        margin: 0 4px;
      }
    }

    .comments-container {
      max-width: $main-width;
      width: 100%;
      margin: 20px auto 0 auto;
    }

    &.loading {
      opacity: 0;
    }
  }
}
</style>
