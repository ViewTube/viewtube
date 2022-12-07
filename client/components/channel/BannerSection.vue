<script setup lang="ts">
import { ApiDto } from 'viewtube/shared';
import SubscribeButton from '@/components/buttons/SubscribeButton.vue';
import humanNumber from 'human-number';

const props = defineProps<{
  pending: boolean;
  channelInfo: ApiDto<'ChannelInfoDto'>;
}>();

const subscriberCount = computed(() => humanNumber(props.channelInfo?.subscriberCount));
</script>

<template>
  <div v-if="channelInfo && !pending" class="banner-section">
    <Spinner v-if="pending" class="centered" />
    <ChannelBanner
      class="channel-banner"
      :src="channelInfo?.authorBanners?.[1]?.url"
      :bannerHqSrc="channelInfo?.authorBanners?.[channelInfo?.authorBanners?.length - 1]?.url"
    />
    <div class="info">
      <div class="avatar">
        <img class="avatar-img" :src="channelInfo?.authorThumbnails?.[2]?.url" />
      </div>
      <h3 class="title">{{ channelInfo?.author }}</h3>
      <div class="subscribe">
        <p class="subscribers">{{ subscriberCount }}</p>
        <SubscribeButton :channelId="channelInfo.authorId" />
      </div>
      <p class="channel-menu">menu</p>
      <ChannelBannerStats class="banner-stats" :channelInfo="channelInfo" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.banner-section {
  position: relative;

  .info {
    background-color: var(--bgcolor-alt);
    padding: 10px;
    display: grid;
    grid-template-areas:
      'avatar title subscribe'
      'menu menu stats';
    grid-template-columns: 100px 1fr 1fr;
    grid-template-rows: 50px 1fr;
    gap: 10px 20px;

    .avatar {
      z-index: 102;
      grid-area: avatar;
      width: 100%;
      height: 200%;

      .avatar-img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        box-shadow: $max-shadow;
        transform: translateY(-50%);
      }
    }

    .title {
      grid-area: title;
      font-size: 2rem;
      align-self: center;
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
