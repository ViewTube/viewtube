<script setup lang="ts">
const route = useRoute();

const channelId = computed(() => route.params.id?.toString() ?? null);

const { data: channelInfo, pending } = useGetChannelInfo(channelId);

const pages = computed(() => [
  {
    title: 'Home',
    link: `/channel/${channelId.value}`
  },
  {
    title: 'Videos',
    link: `/channel/${channelId.value}/videos`
  },
  {
    title: 'Playlists',
    link: `/channel/${channelId.value}/playlists`
  },
  {
    title: 'Community',
    link: `/channel/${channelId.value}/community`
  },
  {
    title: 'Channels',
    link: `/channel/${channelId.value}/channels`
  },
  {
    title: 'About',
    link: `/channel/${channelId.value}/about`
  }
]);
</script>

<template>
  <div class="channel">
    <MetaPageHead
      :title="`${channelInfo?.author}`"
      :description="`${channelInfo?.description?.substring(0, 100)}`"
      :image="`${channelInfo?.authorThumbnails?.[0]?.url}`"
    />
    <ChannelBannerSection :pending="pending" :channelInfo="channelInfo" />
    <ChannelBannerLinks
      class="links"
      :bannerLinks="{ ...channelInfo?.channelLinks, type: 'links' }"
    />
    <TabMenu :pages="pages" />
    <NuxtPage :pageKey="'someKey'" />
  </div>
</template>

<style lang="scss" scoped>
.channel {
  margin-top: $header-height;
}
</style>
