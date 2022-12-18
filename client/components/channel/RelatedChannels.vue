<script setup lang="ts">
import { ApiDto } from 'viewtube/shared';

type RelatedChannelsType = ApiDto<'ChannelInfoDto'>['relatedChannels']['items'];

defineProps<{
  relatedChannels: {
    items: RelatedChannelsType;
    continuation: string;
  };
}>();

const { proxyUrl } = useImgProxy();
</script>

<template>
  <div v-if="relatedChannels" class="related-channels">
    <nuxt-link
      v-for="channel in relatedChannels?.items"
      :key="channel.channelId"
      v-ripple
      v-tippy="channel.channelName"
      class="related-channel tooltip"
      :to="{ path: `/channel/${channel.channelId}` }"
    >
      <div class="related-channel-thumbnail">
        <div class="related-channel-thumbnail-image">
          <img :src="proxyUrl(channel.thumbnail?.[2].url)" :alt="channel.channelName" />
        </div>
      </div>
      <div class="related-channel-info">
        <p class="related-channel-title">
          {{ channel.channelName }}
        </p>
        <p class="subscriber-count">{{ channel.subscriberText }}</p>
        <p class="video-count">{{ channel.videoCount?.toLocaleString('en-US') }} videos</p>
      </div>
    </nuxt-link>
  </div>
</template>

<style lang="scss" scoped>
.related-channels {
  width: 100%;
  max-width: $main-width;
  margin: 5px auto 0 auto;
  width: 100%;
  height: 280px;
  overflow: auto hidden;
  scrollbar-width: thin;
  box-sizing: border-box;
  position: relative;

  .scroll-container {
    display: flex;
    flex-direction: row;
    width: auto;
    position: absolute;
    margin: 5px 2px;

    .related-channel {
      width: 120px;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      margin: 0 15px 0 0;
      padding: 10px;
      box-shadow: 0 0 0 2px var(--theme-color-translucent);
      border-radius: 3px;
      transition: background-color 300ms $intro-easing;

      &:hover {
        background-color: var(--bgcolor-alt);
      }

      .related-channel-thumbnail {
        width: 100%;

        .related-channel-thumbnail-image {
          height: 100%;
          width: 100;

          img {
            width: 100%;
          }
        }
      }
      .related-channel-info {
        width: 100%;
        overflow: hidden;

        .related-channel-title {
          display: inline-block;
          width: 100%;
          color: var(--subtitle-color);
          font-family: $default-font;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .subscriber-count,
        .video-count {
          margin: 5px 0 0 0;
          color: var(--subtitle-color-light);
          width: 100%;
        }
      }
    }
  }
}
</style>
