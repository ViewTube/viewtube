<script setup lang="ts">
import RelatedChannels from '@/components/channel/RelatedChannels.vue';

const route = useRoute();
const channelId = computed(() => route.params.id?.toString() ?? null);
const { data: channelInfo, pending } = useGetChannelInfo(channelId);
const { data: channelHome, pending: pendingHome } = useGetChannelHome(channelId);
</script>

<template>
  <div v-if="!pending && !pendingHome && channelInfo && channelHome" class="channel-home">
    <SectionTitle title="Info" />
    <pre class="channel-description">{{ channelInfo.description?.trim() }}</pre>
    <ChannelBannerLinks :bannerLinks="{ ...channelInfo?.channelLinks, type: 'links' }" />
    <SectionTitle title="Related channels" />
    <RelatedChannels
      v-if="channelInfo.relatedChannels"
      :relatedChannels="channelInfo.relatedChannels"
    />
    <SectionTitle title="Featured video" />
    <ChannelFeaturedVideo :featured-video="channelHome.featuredVideo" />
    <SectionTitle title="Section" />
  </div>
</template>

<style lang="scss" scoped>
.channel-home {
  padding: 0 10px;

  .channel-description {
    white-space: pre-wrap;
    font-family: $default-font;
    margin: 0;
    word-break: break-word;
  }
}
</style>
