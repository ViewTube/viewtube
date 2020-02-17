<template>
  <div class="comment" :class="{ open: repliesLoaded }">
    <router-link :to="{path: '/channel/' + comment.authorId}">
      <img
        class="comment-author-image"
        :src="comment.authorThumbnails[2].url"
        :alt="comment.author"
      />
    </router-link>
    <div class="comment-container">
      <div class="comment-author">
        <router-link
          class="comment-author-link"
          :to="{path: '/channel/' + comment.authorId}"
          :class="{ owner: comment.authorIsChannelOwner }"
        >{{ comment.author }}</router-link>
      </div>
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
          v-ripple
        >show {{ comment.replies.replyCount.toLocaleString() }} replies</a>
        <a
          href="#"
          class="comment-reply-count badge-btn"
          @click.prevent="hideReplies"
          v-if="repliesLoaded"
          v-ripple
        >hide replies</a>
        <Spinner v-if="loadingReplies"></Spinner>
        <div
          class="comment-replies-list"
          v-if="repliesLoaded"
        >
          <div class="comment-replies-list-height" ref="commentRepliesListHeight">
            <Comment
              class="subcomment"
              v-for="subComment in replies"
              :key="subComment.commentId"
              :comment="subComment"
            />
          </div>
          <a
            href="#"
            class="show-more-replies badge-btn"
            @click.prevent="loadMoreReplies"
            v-if="repliesContinuationLink && !repliesContinuationLoading"
            v-ripple
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
  data: () => ({
    replies: [],
    loadingReplies: false,
    repliesLoaded: false,
    repliesContinuationLink: null,
    repliesContinuationLoading: false
  }),
  mounted() {
    tippy('.tooltip', {
      duration: 300,
      arrow: false,
      delay: [500, 100],
      touch: 'hold',
      placement: 'bottom'
    })
  },
  methods: {
    hideReplies() {
      this.repliesLoaded = false
    },
    loadReplies() {
      this.loadingReplies = true
      const repliesId = this.comment.replies.continuation
      const videoId = this.$route.query.v
      fetch(
        `${Commons.getApiUrl()}comments/${videoId}?continuation=${repliesId}`,
        {
          cache: 'force-cache',
          method: 'GET'
        }
      )
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
    loadMoreReplies() {
      this.repliesContinuationLoading = true
      const videoId = this.$route.query.v
      fetch(
        `${Commons.getApiUrl()}comments/${videoId}?continuation=${
        this.repliesContinuationLink
        }`,
        {
          cache: 'force-cache',
          method: 'GET'
        }
      )
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

<style lang='scss'>
.comment {
  width: 100%;
  margin: 30px 0 20px 0;
  display: flex;
  flex-direction: row;
  font-family: $default-font;
  justify-content: flex-start;
  background-color: var(--bgcolor-alt);
  padding: 10px;
  box-sizing: border-box;
  border-radius: 4px;
  border: 2px solid var(--bgcolor-alt);
  transition: border 300ms $intro-easing;

  &.open {
    border: 2px solid var(--theme-color);
  }

  &.subcomment {
    padding: 0;
  }

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

      p {
        width: auto;
      }

      &.owner {
        color: var(--theme-color);
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
      color: var(--subtitle-color-light);

      .comment-property {
        span.material-design-icon {
          svg.material-design-icon__svg {
            height: 1.2em !important;
            width: 1.2em !important;
          }
        }
      }

      .edited {
        color: var(--theme-color);
        margin: 0 10px 0 0;

        span {
          margin: 0 2px;
          color: var(--theme-color);
          height: unset !important;
        }
      }
      .published {
        margin: 0 5px 0 0;
      }
      .likes {
        color: var(--subtitle-color-light);

        span {
          margin: 0 0 0 10px;
          color: var(--subtitle-color-light);
        }
      }
      .creatorHeart {
        margin: 0 10px;

        span {
          color: var(--theme-color);
        }
      }
    }
    .comment-replies {
      .comment-reply-count {
        margin: 10px 0 5px 0;
      }
      .comment-replies-list {
        overflow: hidden;
      }
      .show-more-replies {
      }
    }
  }
}
</style>
