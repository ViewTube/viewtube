<script setup lang="ts">
import { useMessagesStore } from '@/store/messages';
import BadgeButton from '@/components/buttons/BadgeButton.vue';

const route = useRoute();
const messagesStore = useMessagesStore();

const channelId = computed(() => getChannelIdFromParam(route.params.id));
const { data, pending, error } = useGetChannelCommunityPosts(channelId);

const channelInfo = ref(data);
const morePending = ref(false);

const communityPosts = ref(data);

const loadMore = async () => {
  morePending.value = true;
  if (communityPosts.value?.continuation) {
    try {
      const additionalCommunityPosts = await getChannelCommunityPostsContinuation(
        communityPosts.value?.continuation,
        communityPosts.value?.innerTubeApi
      );
      communityPosts.value.items = [
        ...communityPosts.value.items,
        ...additionalCommunityPosts.items
      ];
      communityPosts.value.continuation = additionalCommunityPosts.continuation;
      communityPosts.value.innerTubeApi = additionalCommunityPosts.innerTubeApi;
    } catch (error) {
      messagesStore.createMessage({
        type: 'error',
        title: 'Failed to load more community posts',
        message:
          (error as any).message ??
          "More community posts don't seem to be available, or something went wrong."
      });
    }
  }
  morePending.value = false;
};
</script>

<template>
  <Spinner v-if="pending" />
  <div v-if="!pending && data" class="community-posts">
    <CommunityPost
      v-for="(communityPost, index) in communityPosts.items"
      :key="index"
      :community-post="communityPost"
    />
    <div class="show-more">
      <BadgeButton
        v-if="channelInfo?.continuation"
        class="show-more-button"
        :loading="morePending"
        @click.prevent="loadMore"
      >
        <Icon name="mdi:reload" />
        <p>Show more</p>
      </BadgeButton>
    </div>
  </div>
  <ChannelPageError v-if="error" error-message="An error occurred when loading community posts." />
</template>

<style lang="scss" scoped>
.community-posts {
  display: flex;
  flex-direction: column;
  padding: 15px;
  gap: 20px;
  max-width: 900px;
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;

  .show-more {
    display: flex;
    justify-content: center;
  }
}
</style>
