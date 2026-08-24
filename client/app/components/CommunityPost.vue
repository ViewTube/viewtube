<script setup lang="ts">
import type { ApiDto } from '@viewtube/shared';

const props = defineProps<{
  communityPost: ApiDto<'VTCommunityPostDto'>;
}>();

const { createTextLinks } = useCreateTextLinks();

const communityPostContent = computed(() => {
  return createTextLinks(props.communityPost.text);
});
</script>

<template>
  <div class="community-post">
    <p class="creation-time">
      {{ communityPost.published?.text }} &bull; {{ communityPost.author?.name }}
    </p>
    <div class="post-text links">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <pre class="text-pre" v-html="communityPostContent" />
    </div>
    <div v-if="communityPost.attachment" class="post-content">
      <CommunityPostImage
        v-if="communityPost.attachment.type === 'image'"
        :post-image="communityPost.attachment.image"
        expandable
      />
      <CommunityPostPoll
        v-if="communityPost.attachment.type === 'poll' || communityPost.attachment.type === 'quiz'"
        :post-poll="communityPost.attachment.poll"
      />
      <CommunityPostVideo
        v-if="communityPost.attachment.type === 'video'"
        :post-video="communityPost.attachment.video"
      />
      <CommunityPostMultiImage
        v-if="communityPost.attachment.type === 'multiImage'"
        :post-images="communityPost.attachment.images"
      />
    </div>
    <div class="post-info">
      <div class="info-item">
        <VTIcon name="mdi:thumb-up" />
        <p>{{ communityPost.voteText ?? communityPost.likeCount ?? 0 }}</p>
      </div>
      <div class="info-item">
        <VTIcon name="mdi:comment-outline" />
        <p class="comments">{{ communityPost.commentText ?? 0 }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.community-post {
  background-color: var(--bgcolor-alt);
  border-radius: 8px;
  padding: 12px 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .creation-time {
    font-size: 0.8rem;
    color: var(--subtitle-color-light);
  }

  .post-text {
    .text-pre {
      color: var(--title-color);
      font-size: 1rem;
      font-family: variables.$default-font;
      white-space: pre-wrap;
      margin: 0;
    }
  }

  .post-info {
    display: flex;
    flex-direction: row;
    gap: 15px;

    .info-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 5px;
      color: var(--subtitle-color-light);

      :deep(.vt-icon) {
        width: 20px;
        height: 20px;
      }
    }
  }
}
</style>
