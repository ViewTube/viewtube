<script setup lang="ts">
import RelatedChannels from '@/components/channel/RelatedChannels.vue';

const route = useRoute();
const channelId = computed(() => route.params.id?.toString() ?? null);
const { data: channelInfo, pending } = useGetChannelInfo(channelId);
</script>

<template>
  <div v-if="!pending && channelInfo" class="channel-home">
    <p class="channel-description" v-html="channelInfo.description" />
    <ChannelBannerLinks :bannerLinks="{ ...channelInfo?.channelLinks, type: 'links' }" />
    <RelatedChannels
      v-if="channelInfo.relatedChannels"
      :relatedChannels="channelInfo.relatedChannels"
    />
  </div>
</template>

<style lang="scss" scoped>
.channel-home {
  .channel-description {
    padding: 10px 10px 0 10px;
  }
}
</style>
