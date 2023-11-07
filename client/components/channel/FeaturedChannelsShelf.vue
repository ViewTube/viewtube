<script setup lang="ts">
import RelatedChannels, { type RelatedChannelsType } from './RelatedChannels.vue';

type ChannelItemType = {
  channelName: string;
  channelId: string;
  channelUrl: string;
  thumbnail: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  videoCount: string;
  subscriberText: string;
  subscriberCount: number;
  verified: number;
  officialArtist: number;
};

type ShelfType = {
  shelfName: string;
  shelfUrl: string;
  type: string;
  items: Array<ChannelItemType>;
};

defineProps<{
  shelf: ShelfType;
}>();
</script>

<template>
  <div class="channel-shelf" @touchstart.stop>
    <RelatedChannels
      :related-channels="{ items: shelf.items as unknown as RelatedChannelsType, type: 'channels' }"
    />
  </div>
</template>

<style lang="scss" scoped>
.channel-shelf {
  overflow: auto hidden;
  display: flex;
  gap: 20px;

  .channel-shelf-item {
    min-width: 300px;
  }
}
</style>
