<script setup lang="ts">
import { useMessagesStore } from '~/store/messages';
import RelatedChannels from '../RelatedChannels.vue';
import BadgeButton from '~/components/buttons/BadgeButton.vue';

const route = useRoute();
const messagesStore = useMessagesStore();

const channelId = computed(() => getChannelIdFromParam(route.params.id));
const { data, pending } = useGetChannelInfo(channelId);

const channelInfo = ref(data);
const morePending = ref(false);

const loadMore = async () => {
  morePending.value = true;
  if (channelInfo.value.relatedChannels.continuation) {
    try {
      const additionalChannels = await getRelatedChannelsContinuation(
        channelInfo.value.relatedChannels.continuation
      );
      channelInfo.value.relatedChannels.items = [
        ...(channelInfo.value.relatedChannels.items as any),
        ...additionalChannels.items
      ];
      channelInfo.value.relatedChannels.continuation = additionalChannels.continuation;
    } catch (error) {
      messagesStore.createMessage({
        type: 'error',
        title: 'Failed to load more channels',
        message:
          (error as any).message ??
          "More channels don't seem to be available, or something went wrong."
      });
    }
  }
  morePending.value = false;
};
</script>

<template>
  <Spinner v-if="pending" />
  <div v-if="!pending && channelInfo.relatedChannels?.items?.length > 0" class="featured-channels">
    <RelatedChannels :related-channels="{ ...data?.relatedChannels, type: 'channels' }" vertical />
    <div class="show-more">
      <BadgeButton
        v-if="channelInfo?.relatedChannels?.continuation"
        class="show-more-button"
        :loading="morePending"
        @click.prevent="loadMore"
      >
        <VTIcon name="mdi:reload" />
        <p>Show more</p>
      </BadgeButton>
    </div>
  </div>
  <div v-if="!pending && data.relatedChannels?.items.length === 0" class="no-related-channels">
    <p>This channel doesn't feature other channels</p>
  </div>
</template>

<style lang="scss" scoped>
.featured-channels {
  margin: 15px;

  .show-more {
    display: flex;

    .show-more-button {
      margin: 15px auto 20px auto;
    }
  }
}

.no-related-channels {
  display: flex;
  justify-content: center;
  margin: 15px 0 0 0;
  height: 90vh;
}
</style>
