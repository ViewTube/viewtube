<template>
  <div class="comment">
    <img class="comment-author-image" :src="comment.authorThumbnails[2].url" :alt="comment.author" />
    <div class="comment-container">
      <router-link class="comment-author" :to="{path: '/channel/' + comment.authorId}">
        <p>{{ comment.author }}</p>
      </router-link>
      <div class="comment-content" v-html="comment.content"></div>
      <div class="comment-properties">
        <div class="edited" v-if="comment.isEdited">
          <PenIcon />
          <span>edited</span>
        </div>
        <div class="published">
          <span>{{ comment.publishedText }}</span>
        </div>
        <div class="likes">
          <ThumbsUpIcon />
          <span>{{ comment.likeCount.toLocaleString() }}</span>
        </div>
        <div class="creatorHeart" v-if="comment.creatorHeart !== undefined">
          <HeartIcon />
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
    comment: null
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

  },
  methods: {
    loadReplies: function () {
      this.loadingReplies = true
      let repliesId = this.comment.replies.continuation
      let videoId = this.$route.query.v
      fetch(`${Commons.apiUrl}comments/${videoId}?continuation=${repliesId}`, {
        cache: 'force-cache'
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
      fetch(`${Commons.apiUrl}comments/${videoId}?continuation=${this.repliesContinuationLink}`, {
        cache: 'force-cache'
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

<style lang="scss" scoped>
.comment {
  width: 100%;
  margin: 20px 0 10px 0;
  display: flex;
  flex-direction: row;

  .comment-author-image {
    width: 55px;
    height: 55px;
  }

  .comment-container {
    .comment-author {
      display: flex;
      flex-direction: row;
      margin: 10px 0;
      align-items: center;
    }

    .comment-content {
      font-size: 1.1rem;
    }
    .comment-properties {
      .edited {
      }
      .published {
      }
      .likes {
      }
      .creatorHeart {
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
