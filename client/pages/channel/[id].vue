<script setup lang="ts">
import 'keen-slider/keen-slider.min.css';

definePageMeta({
  key: r => `channel-${r.params.id?.toString() ?? ''}`,
  name: 'channel'
});

const route = useRoute();

const channelId = computed(() => route.params.id?.toString() ?? null);

const { data: channelInfo } = useGetChannelInfo(channelId);

const { pages, currentPage, changePage, swipeContainerRef } = useChannelPages();
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

    <div ref="swipeContainerRef" class="channel-pages-container keen-slider">
      <div class="keen-slider__slide channel-page">
        <ChannelPageHome />
      </div>
      <div class="keen-slider__slide channel-page">
        <ChannelPageVideos />
      </div>
      <div class="keen-slider__slide channel-page">
        <ChannelPagePlaylists />
      </div>
      <div class="keen-slider__slide channel-page">
        <ChannelPageCommunity />
      </div>
      <div class="keen-slider__slide channel-page">
        <ChannelPageChannels />
      </div>
      <div class="keen-slider__slide channel-page">
        <ChannelPageAbout />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.channel {
  margin-top: $header-height;

  .channel-pages-container {
    .channel-page {
      height: 100%;
    }
  }
}
</style>
