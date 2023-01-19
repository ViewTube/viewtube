<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';

definePageMeta({
  name: 'channel',
  path: '/channel/:id(.*)',
  alias: ['/:id(@.*)']
});

const route = useRoute();

const channelId = computed(() => route.params.id?.toString()?.split('/')?.[0] ?? null);

const { data: channelInfo } = useGetChannelInfo(channelId);

const {
  pages,
  currentPage,
  changePage,
  swipeContainerRef,
  initializationPending,
  onSwiperInstance
} = useChannelPages();
</script>

<template>
  <div class="channel">
    <Spinner v-if="!channelInfo" class="centered" />
    <MetaPageHead
      :title="`${channelInfo?.author}`"
      :description="`${channelInfo?.description?.substring(0, 100)}`"
      :image="`${channelInfo?.authorThumbnails?.[0]?.url}`"
    />
    <ChannelBannerSection
      :channel-info="channelInfo"
      :pages="pages"
      :current-page="currentPage"
      @change-page="changePage"
    />
    <swiper ref="swipeContainerRef" class="channel-pages-container" @swiper="onSwiperInstance">
      <swiper-slide v-if="!initializationPending || currentPage === 'home'" class="channel-page">
        <ChannelPageHome />
      </swiper-slide>
      <swiper-slide v-if="!initializationPending || currentPage === 'videos'" class="channel-page">
        <ChannelPageVideos />
      </swiper-slide>
      <swiper-slide
        v-if="!initializationPending || currentPage === 'playlists'"
        class="channel-page"
      >
        <ChannelPagePlaylists />
      </swiper-slide>
      <swiper-slide
        v-if="!initializationPending || currentPage === 'community'"
        class="channel-page"
      >
        <ChannelPageCommunity />
      </swiper-slide>
      <swiper-slide
        v-if="!initializationPending || currentPage === 'channels'"
        class="channel-page"
      >
        <ChannelPageChannels />
      </swiper-slide>
      <swiper-slide v-if="!initializationPending || currentPage === 'about'" class="channel-page">
        <ChannelPageAbout />
      </swiper-slide>
    </swiper>
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
