<template>
  <div class="comment">
    <router-link class="comment-author" :to="{path: '/channel/' + comment.authorId}">
      <img :src="comment.authorThumbnails[2].url" :alt="comment.author" />
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
        class="comment-reply-count"
        @click.prevent="showReplies"
        v-if="!repliesLoaded"
      >show {{ comment.replies.replyCount.toLocaleString() }} replies</a>
      <div class="comment-replies-list" v-if="repliesLoaded">
        <Comment v-for="subComment in replies" :key="subComment.commentId" :comment="subComment" />
      </div>
    </div>
  </div>
</template>

<script>
import PenIcon from 'icons/Pencil'
import ThumbsUpIcon from 'icons/ThumbUp'
import HeartIcon from 'icons/Heart'
import Commons from '@/commons.js'

export default {
  name: 'comment',
  components: {
    PenIcon,
    ThumbsUpIcon,
    HeartIcon,
    Comment: () => import('@/components/Comment')
  },
  props: {
    comment: null
  },
  data: function () {
    return {
      replies: [],
      repliesLoaded: false
    }
  },
  mounted: function () {

  },
  methods: {
    showReplies: function () {
      let repliesId = this.comment.replies.continuation
      let videoId = this.$route.query.v
      fetch(`${Commons.apiUrl}comments/${videoId}?continuation=${repliesId}`, {
        cache: 'force-cache'
      })
        .then(response => response.json())
        .then(data => {
          this.replies = data.comments
          console.log(data)
          this.repliesLoaded = true
        })
        .catch(error => {
          console.error(error)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>