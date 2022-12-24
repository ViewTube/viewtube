<script setup lang="ts">
import 'keen-slider/keen-slider.min.css';

definePageMeta({
  name: 'channel',
  path: '/channel/:id(@.*)',
  alias: ['/:id(@.*)']
});

const route = useRoute();

const channelId = computed(() => route.params.id?.toString()?.split('/')?.[0] ?? null);

const { data: channelInfo } = useGetChannelInfo(channelId);

const { pages, currentPage, changePage, swipeContainerRef, initializationPending } =
  useChannelPages();
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
      <div
        v-if="!initializationPending || currentPage === 'home'"
        class="keen-slider__slide lazy__slide channel-page"
      >
        <ChannelPageHome />
      </div>
      <div
        v-if="!initializationPending || currentPage === 'videos'"
        class="keen-slider__slide lazy__slide channel-page"
      >
        <ChannelPageVideos />
      </div>
      <div
        v-if="!initializationPending || currentPage === 'playlists'"
        class="keen-slider__slide lazy__slide channel-page"
      >
        <ChannelPagePlaylists />
      </div>
      <div
        v-if="!initializationPending || currentPage === 'community'"
        class="keen-slider__slide lazy__slide channel-page"
      >
        <ChannelPageCommunity />
      </div>
      <div
        v-if="!initializationPending || currentPage === 'channels'"
        class="keen-slider__slide lazy__slide channel-page"
      >
        <ChannelPageChannels />
      </div>
      <div
        v-if="!initializationPending || currentPage === 'about'"
        class="keen-slider__slide lazy__slide channel-page"
      >
        <ChannelPageAbout />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.channel {
  margin-top: $header-height;

  .channel-pages-container {
    user-select: auto;
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;

    .channel-page {
      height: 100%;
    }
  }
}
</style>
