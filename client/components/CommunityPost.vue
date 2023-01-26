<script setup lang="ts">
import { ApiDto } from 'viewtube/shared';

defineProps<{
  communityPost: ApiDto<'ChannelCommunityPostDto'>;
}>();
</script>

<template>
  <div class="community-post">
    <p class="creation-time">{{ communityPost.publishedText }}</p>
    <div v-create-links class="post-text links">
      <p>{{ communityPost.postText }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.community-post {
  background-color: var(--bgcolor-alt);
  border-radius: 8px;
  padding: 10px;

  .creation-time {
    font-size: 0.8rem;
    color: var(--subtitle-color-light);
  }

  .post-text {
    margin: 5px 0 0 0;
  }
}
</style>
