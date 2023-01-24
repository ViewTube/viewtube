<script setup lang="ts">
import VerifiedIcon from 'vue-material-design-icons/CheckDecagram.vue';
import { ApiDto } from 'viewtube/shared';

export type RelatedChannelsType = ApiDto<'ChannelInfoDto'>['relatedChannels']['items'];

defineProps<{
  relatedChannels: {
    items?: RelatedChannelsType;
    continuation?: string | null;
    type: 'channels';
  };
}>();

const { proxyUrl } = useImgProxy();
</script>

<template>
  <div v-if="relatedChannels?.items" class="related-channels">
    <div class="scroll-container">
      <nuxt-link
        v-for="channel in relatedChannels?.items"
        :key="channel.channelId"
        v-ripple
        class="related-channel tooltip"
        :to="{ path: `/channel/${channel.channelId}` }"
      >
        <div class="related-channel-thumbnail">
          <div class="related-channel-thumbnail-image">
            <img
              :src="proxyUrl(channel.thumbnail?.[2]?.url ?? channel.thumbnail?.[1]?.url)"
              :alt="channel.channelName"
            />
          </div>
        </div>
        <div class="related-channel-info">
          <div v-tippy="channel.channelName" class="related-channel-title">
            <p class="related-channel-title-text">
              {{ channel.channelName }}
            </p>
            <VerifiedIcon class="verified-icon" />
          </div>
          <p class="subscriber-count">{{ channel.subscriberText }}</p>
          <p class="video-count">{{ channel.videoCount?.toLocaleString('en-US') }} videos</p>
        </div>
      </nuxt-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.related-channels {
  width: 100%;
  height: 280px;
  max-width: $main-width;
  margin: 5px auto 0 auto;
  overflow: scroll;
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
      width: 150px;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      margin: 0 15px 0 0;
      padding: 10px;
      box-shadow: 0 0 0 2px var(--theme-color-translucent);
      border-radius: 3px;
      transition: background-color 300ms $intro-easing, box-shadow 300ms $intro-easing;

      &:hover {
        background-color: var(--bgcolor-alt);
        box-shadow: 0 0 0 2px var(--theme-color);
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
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          width: 100%;
          color: var(--subtitle-color);
          font-family: $default-font;

          .related-channel-title-text {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            line-height: 24px;
          }

          .verified-icon {
            :deep(.material-design-icon__svg) {
              width: 18px;
              height: 18px;
            }
          }
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
