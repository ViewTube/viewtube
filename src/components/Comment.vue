<template>
  <div class="comment">
    <img class="comment-author-image" :src="comment.authorThumbnails[2].url" :alt="comment.author" />
    <div class="comment-container">
      <router-link
        class="comment-author"
        :to="{path: '/channel/' + comment.authorId}"
        :class="{ owner: comment.authorIsChannelOwner }"
      >
        <p>{{ comment.author }}</p>
      </router-link>
      <div class="comment-content" v-html="comment.content"></div>
      <div class="comment-properties">
        <div class="published comment-property">
          <span>{{ comment.publishedText }}</span>
        </div>
        <div class="edited comment-property" v-if="comment.isEdited">
          <PenIcon />
          <span>edited</span>
        </div>
        <div class="likes comment-property">
          <ThumbsUpIcon />
          <span>{{ comment.likeCount.toLocaleString() }}</span>
        </div>
        <div
          class="creatorHeart comment-property tooltip"
          v-if="comment.creatorHeart !== undefined"
          :data-tippy-content="`❤ by ${creatorName}`"
        >
          <HeartIcon title />
        </div>
      </div>
      <div class="comment-replies" v-if="comment.replies !== undefined">
        <a
          href="#"
          class="comment-reply-count badge-btn"
          @click.prevent="loadReplies"
          v-if="!loadingReplies && !repliesLoaded"
        >show {{ comment.replies.replyCount.toLocaleString() }} replies</a>
        <Spinner v-if="loadingReplies"></Spinner>
        <div class="comment-replies-list" v-if="repliesLoaded">
          <Comment v-for="subComment in replies" :key="subComment.commentId" :comment="subComment" />
          <a
            href="#"
            class="show-more-replies badge-btn"
            @click.prevent="loadMoreReplies"
            v-if="repliesContinuationLink && !repliesContinuationLoading"
          >show more</a>
          <Spinner v-if="repliesContinuationLoading"></Spinner>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PenIcon from 'icons/Pencil'
import ThumbsUpIcon from 'icons/ThumbUp'
import HeartIcon from 'icons/Heart'
import Commons from '@/commons.js'
import Spinner from '@/components/Spinner'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

export default {
  name: 'comment',
  components: {
    PenIcon,
    ThumbsUpIcon,
    HeartIcon,
    Spinner,
    Comment: () => import('@/components/Comment')
  },
  props: {
    comment: null,
    creatorName: String
  },
  data: function () {
    return {
      replies: [],
      loadingReplies: false,
      repliesLoaded: false,
      repliesContinuationLink: null,
      repliesContinuationLoading: false
    }
  },
  mounted: function () {
    tippy('.tooltip', {
      duration: 300,
      arrow: false,
      delay: [500, 100],
      touch: 'hold',
      placement: 'bottom'
    })
  },
  methods: {
    loadReplies: function () {
      this.loadingReplies = true
      let repliesId = this.comment.replies.continuation
      let videoId = this.$route.query.v
      fetch(`${Commons.getApiUrl()}comments/${videoId}?continuation=${repliesId}`, {
        cache: 'force-cache',
        method: 'GET'
      })
        .then(response => response.json())
        .then(data => {
          this.replies = data.comments
          this.repliesContinuationLink = data.continuation || null
          this.repliesLoaded = true
          this.loadingReplies = false
        })
        .catch(error => {
          console.error(error)
        })
    },
    loadMoreReplies: function () {
      this.repliesContinuationLoading = true
      let videoId = this.$route.query.v
      fetch(`${Commons.getApiUrl()}comments/${videoId}?continuation=${this.repliesContinuationLink}`, {
        cache: 'force-cache',
        method: 'GET'
      })
        .then(response => response.json())
        .then(data => {
          this.replies = this.replies.concat(data.comments)
          this.repliesContinuationLink = data.continuation || null
          this.repliesContinuationLoading = false
        })
        .catch(error => {
          console.error(error)
        })
    }
  }
}
</script>

<style lang="scss">
.comment {
  width: 100%;
  margin: 30px 0 20px 0;
  display: flex;
  flex-direction: row;
  font-family: $default-font;
  justify-content: flex-start;

  .comment-author-image {
    width: 55px;
    height: 55px;
  }

  .comment-container {
    padding: 0 10px;
    width: 90%;

    .comment-author {
      display: flex;
      flex-direction: row;
      margin: 0;
      align-items: flex-start;
      font-weight: 700;

      &.owner {
        color: $theme-color;
      }
    }

    .comment-content {
      font-size: 1rem;
      margin: 5px 0;
      overflow: hidden;
      white-space: pre-wrap;
      overflow-wrap: break-word;
    }

    .comment-properties {
      display: flex;
      flex-direction: row;
      color: $subtitle-color-light;

      .comment-property {
        span.material-design-icon {
          svg.material-design-icon__svg {
            height: 1.2em !important;
            width: 1.2em !important;
          }
        }
      }

      .edited {
        color: $theme-color;
        margin: 0 10px 0 0;

        span {
          margin: 0 2px;
          color: $theme-color;
          height: unset !important;
        }
      }
      .published {
        margin: 0 5px 0 0;
      }
      .likes {
        color: $subtitle-color-light;

        span {
          margin: 0 0 0 10px;
          color: $subtitle-color-light;
        }
      }
      .creatorHeart {
        margin: 0 10px;

        span {
          color: $theme-color;
        }
      }
    }
    .comment-replies {
      .comment-reply-count {
      }
      .comment-replies-list {
      }
      .show-more-replies {
      }
    }
  }
}
</style>
