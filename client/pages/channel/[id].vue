<script setup lang="ts">
const route = useRoute();
definePageMeta({
  key: r => `channel-${r.params.id?.toString() ?? ''}`,
  name: 'channel'
});

const channelId = computed(() => route.params.id?.toString() ?? null);

const { data: channelInfo } = useGetChannelInfo(channelId);

const { pages, currentPage, changePage } = useChannelPages();
</script>

<template>
  <div class="channel">
    <MetaPageHead
      :title="`${channelInfo?.author}`"
      :description="`${channelInfo?.description?.substring(0, 100)}`"
      :image="`${channelInfo?.authorThumbnails?.[0]?.url}`"
    />
    <ChannelBannerSection
      :channelInfo="channelInfo"
      :pages="pages"
      :current-page="currentPage"
      @change-page="changePage"
    />

    <ChannelPageHome v-if="currentPage === 'home'" />
    <ChannelPageVideos v-else-if="currentPage === 'videos'" />
    <ChannelPagePlaylists v-else-if="currentPage === 'playlists'" />
    <ChannelPageCommunity v-else-if="currentPage === 'community'" />
    <ChannelPageChannels v-else-if="currentPage === 'channels'" />
    <ChannelPageAbout v-else-if="currentPage === 'about'" />
  </div>
</template>

<style lang="scss" scoped>
.channel {
  margin-top: $header-height;
}
</style>
