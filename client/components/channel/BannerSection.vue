<script setup lang="ts">
import { ApiDto } from 'viewtube/shared';
import SubscribeButton from '@/components/buttons/SubscribeButton.vue';
import humanNumber from 'human-number';

const props = defineProps<{
  channelInfo: ApiDto<'ChannelInfoDto'>;
  pages: Array<{
    title: string;
    link: string;
    pageName: string;
  }>;
  currentPage: string;
}>();

const emit = defineEmits<{
  (event: 'changePage', url: string): void;
}>();

const changePage = (pageName: string) => {
  emit('changePage', pageName);
};

const imgProxy = useImgProxy();

const subscriberCount = computed(() => humanNumber(props.channelInfo?.subscriberCount));
</script>

<template>
  <div v-if="channelInfo" class="banner-section">
    <ChannelBanner
      class="channel-banner"
      :src="channelInfo?.authorBanners?.[3]?.url"
      :bannerHqSrc="channelInfo?.authorBanners?.[channelInfo?.authorBanners?.length - 1]?.url"
    />
    <div class="info">
      <div class="avatar">
        <img class="avatar-img" :src="imgProxy.url + channelInfo?.authorThumbnails?.[2]?.url" />
      </div>
      <h3 class="title">{{ channelInfo?.author }}</h3>
      <div class="subscribe">
        <p class="subscribers">{{ subscriberCount }}</p>
        <SubscribeButton :channelId="channelInfo.authorId" />
      </div>
      <TabMenu :pages="pages" :current-page="currentPage" @change-page="changePage" />
      <ChannelBannerStats class="banner-stats" :channelInfo="channelInfo" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.banner-section {
  position: relative;

  .info {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    padding: 10px;
    display: grid;
    grid-template-areas:
      'avatar title subscribe'
      'menu menu stats';
    grid-template-columns: 100px 1fr 200px;
    grid-template-rows: 50px 1fr;
    gap: 10px 20px;
    box-sizing: border-box;

    &::before {
      content: '';
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background-color: var(--bgcolor-alt);
    }

    .avatar {
      z-index: 102;
      grid-area: avatar;
      width: 100%;
      height: 200%;
      pointer-events: none;

      .avatar-img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        box-shadow: $max-shadow;
        transform: translateY(-50%);
        pointer-events: auto;
      }
    }

    .title {
      grid-area: title;
      font-size: 2rem;
      align-self: center;
      z-index: 102;
    }

    .subscribe {
      grid-area: subscribe;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      justify-self: end;
    }

    .channel-menu {
      grid-area: menu;
    }

    .banner-stats {
      grid-area: stats;
      justify-self: end;
    }
  }
}
</style>
