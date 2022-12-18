<script setup lang="ts">
import RelatedChannels from '@/components/channel/RelatedChannels.vue';

const route = useRoute();
const channelId = computed(() => route.params.id?.toString() ?? null);
const { data: channelInfo, pending } = useGetChannelInfo(channelId);
</script>

<template>
  <div v-if="!pending && channelInfo" class="channel-home">
    <SectionTitle title="Info" />
    <p class="channel-description" v-html="channelInfo.description" />
    <ChannelBannerLinks :bannerLinks="{ ...channelInfo?.channelLinks, type: 'links' }" />
    <SectionTitle title="Related channels" />
    <RelatedChannels
      v-if="channelInfo.relatedChannels"
      :relatedChannels="channelInfo.relatedChannels"
    />
  </div>
</template>

<style lang="scss" scoped>
.channel-home {
  padding: 0 10px;
  .channel-description {
  }
}
</style>
