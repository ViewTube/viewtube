<script setup lang="ts">
import type { ApiDto } from '@viewtube/shared';

defineProps<{
  channels: Array<ApiDto<'VTChannelDto'>>;
}>();

const { proxyUrl } = useImgProxy();
</script>

<template>
  <div v-if="channels?.length" class="related-channels">
    <div class="scroll-container">
      <nuxt-link
        v-for="channel in channels"
        :key="channel.id"
        v-ripple
        class="related-channel tooltip"
        :to="{ path: `/channel/${channel.id}` }"
      >
        <div class="related-channel-thumbnail">
          <div class="related-channel-thumbnail-image">
            <img :src="proxyUrl(channel.thumbnails?.[0]?.url)" :alt="channel.name" />
          </div>
        </div>
        <div class="related-channel-info">
          <div v-tippy="channel.name" class="related-channel-title">
            <p class="related-channel-title-text">
              {{ channel.name }}
            </p>
            <VTIcon v-if="channel.isVerified" name="mdi:check-decagram" class="verified-icon" />
          </div>
          <p v-if="channel.subscribers" class="subscriber-count">
            {{ channel.subscribers.toLocaleString('en-US') }} subscribers
          </p>
          <p v-if="channel.videoCount" class="video-count">
            {{ channel.videoCount?.toLocaleString('en-US') }} videos
          </p>
        </div>
      </nuxt-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.related-channels {
  width: 100%;
  max-width: variables.$main-width;
  margin: 5px auto 0 auto;
  // A horizontal strip: scrolling sideways only, and never tall enough to scroll vertically
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  box-sizing: border-box;

  .scroll-container {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: max-content;
    margin: 5px 2px;

    .related-channel {
      width: 150px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      margin: 0 15px 0 0;
      padding: 10px;
      box-shadow: 0 0 0 2px var(--theme-color-translucent);
      border-radius: 3px;
      transition:
        background-color 300ms variables.$intro-easing,
        box-shadow 300ms variables.$intro-easing;

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
          font-family: variables.$default-font;

          .related-channel-title-text {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            line-height: 24px;
          }

          .verified-icon {
            :deep(.vt-icon) {
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
