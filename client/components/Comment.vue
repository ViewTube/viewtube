<template>
  <div class="comment" :class="{ open: repliesLoaded }">
    <nuxt-link :to="{ path: '/channel/' + comment.authorId }" class="comment-author-image-link">
      <img
        class="comment-author-image"
        :src="comment.authorThumbnails[2].url"
        :alt="comment.author"
      />
    </nuxt-link>
    <div class="comment-container">
      <div class="comment-author">
        <nuxt-link
          class="comment-author-link"
          :to="{ path: '/channel/' + comment.authorId }"
          :class="{ owner: comment.authorIsChannelOwner }"
          >{{ comment.author }}</nuxt-link
        >
      </div>
      <div class="comment-content" v-html="comment.content" />
      <div class="comment-properties">
        <div class="published comment-property">
          <span>{{ comment.publishedText }}</span>
        </div>
        <div v-if="comment.isEdited" class="edited comment-property">
          <PenIcon />
          <span>edited</span>
        </div>
        <div class="likes comment-property">
          <ThumbsUpIcon />
          <span>{{ comment.likeCount.toLocaleString('en-US') }}</span>
        </div>
        <div
          v-if="comment.creatorHeart !== undefined"
          v-tippy="`❤ by ${creatorName}`"
          class="creatorHeart comment-property tooltip"
        >
          <HeartIcon title />
        </div>
      </div>
      <div v-if="comment.replies !== undefined" class="comment-replies">
        <BadgeButton
          v-if="!repliesLoaded"
          class="comment-reply-count"
          :click="loadReplies"
          :loading="loadingReplies"
        >
          <CommentIcon />
          <p>
            show
            {{ comment.replies.replyCount.toLocaleString('en-US') }}
            replies
          </p>
        </BadgeButton>
        <BadgeButton v-if="repliesLoaded" class="comment-reply-count" :click="hideReplies">
          <CommentHideIcon />
          <p>hide replies</p>
        </BadgeButton>
        <div v-if="repliesLoaded" class="comment-replies-list">
          <div ref="commentRepliesListHeight" class="comment-replies-list-height">
            <Comment
              v-for="subComment in replies"
              :key="subComment.commentId"
              class="subcomment"
              :comment="subComment"
            />
          </div>
          <BadgeButton
            v-if="!loadingReplies && repliesContinuationLink"
            class="show-more-replies"
            :click="loadMoreReplies"
            :loading="repliesContinuationLoading"
          >
            <LoadMoreIcon />
            <p>show more</p>
          </BadgeButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import PenIcon from 'vue-material-design-icons/Pencil.vue';
import ThumbsUpIcon from 'vue-material-design-icons/ThumbUp.vue';
import HeartIcon from 'vue-material-design-icons/Heart.vue';
import CommentIcon from 'vue-material-design-icons/CommentOutline.vue';
import CommentHideIcon from 'vue-material-design-icons/CommentRemoveOutline.vue';
import LoadMoreIcon from 'vue-material-design-icons/Reload.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import Invidious from '@/plugins/services/invidious.ts';
import Vue from 'vue';

export default Vue.extend({
  name: 'Comment',
  components: {
    PenIcon,
    ThumbsUpIcon,
    HeartIcon,
    CommentIcon,
    CommentHideIcon,
    LoadMoreIcon,
    Comment: () => import('@/components/Comment.vue'),
    BadgeButton
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
  mounted() {},
  methods: {
    hideReplies() {
      this.repliesLoaded = false;
    },
    loadReplies() {
      this.loadingReplies = true;
      const repliesId = this.comment.replies.continuation;
      const videoId = this.$route.query.v;
      const invidious = new Invidious(this.$store.getters['instances/currentInstanceApi']);
      invidious.api
        .comments({
          id: videoId,
          params: {
            continuation: repliesId
          }
        })
        .then(response => {
          this.replies = response.comments;
          this.repliesContinuationLink = response.continuation || null;
          this.repliesLoaded = true;
          this.loadingReplies = false;
        })
        .catch(err => {
          this.$store.dispatch('messages/createMessage', {
            type: 'error',
            title: 'Loading comments failed',
            message: err
          });
          this.loadingReplies = false;
        });
    },
    loadMoreReplies() {
      this.repliesContinuationLoading = true;
      const videoId = this.$route.query.v;
      const invidious = new Invidious(this.$store.getters['instances/currentInstanceApi']);
      invidious.api
        .comments({
          id: videoId,
          params: {
            continuation: this.repliesContinuationLink
          }
        })
        .then(response => {
          this.replies = this.replies.concat(response.comments);
          this.repliesContinuationLink = response.continuation || null;
          this.repliesContinuationLoading = false;
        })
        .catch(error => {
          this.$store.dispatch('messages/createMessage', {
            type: 'error',
            title: 'Loading comments failed',
            message: error
          });
          this.repliesContinuationLoading = false;
        });
    }
  }
});
</script>

<style lang="scss">
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

  .comment-author-image-link {
    height: 55px;
    width: 55px;
    overflow: hidden;
    box-shadow: 0 0 0 1px var(--theme-color);

    .comment-author-image {
      width: 55px;
    }
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
    }
  }
}
</style>
