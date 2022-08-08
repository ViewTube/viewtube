<template>
  <div
    v-if="channel.relatedChannels"
    v-show="channel.relatedChannels.length > 0"
    class="related-channels"
  >
    <div
      v-for="(channelGroup, index) in channel.relatedChannels"
      :key="index"
      class="channel-group"
    >
      <SectionTitle :title="channelGroup.title.replace(':', '')" />
      <div class="channel-group-container">
        <div class="scroll-container">
          <nuxt-link
            v-for="channelEntry in channelGroup.channels"
            :key="channelEntry.authorId"
            v-ripple
            v-tippy="channelEntry.author"
            class="related-channel tooltip"
            :to="{ path: '/channel/' + channelEntry.authorId }"
          >
            <div class="related-channel-thumbnail">
              <div class="related-channel-thumbnail-image">
                <img :src="channelEntry.authorThumbnails[2].url" :alt="channelEntry.author" />
              </div>
            </div>
            <div class="related-channel-info">
              <p class="related-channel-title">
                {{ channelEntry.author }}
              </p>
              <p class="subscriber-count">
                {{ channelEntry.subCount?.toLocaleString('en-US') }} subscribers
              </p>
              <p class="video-count">
                {{ channelEntry.videoCount?.toLocaleString('en-US') }} videos
              </p>
            </div>
          </nuxt-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import SectionTitle from '@/components/SectionTitle.vue';

export default defineComponent({
  name: 'RelatedChannels',
  components: {
    SectionTitle
  },
  props: {
    channel: Object
  }
});
</script>

<style lang="scss" scoped>
.related-channels {
  width: 100%;
  max-width: $main-width;
  margin: 0 auto;
  box-sizing: border-box;
  z-index: 14;
  background-color: var(--bgcolor-main);
  display: flex;
  flex-direction: row;

  .channel-group {
    margin: 10px;
    width: 100%;
    box-sizing: border-box;

    .channel-group-container {
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
  }
}
</style>
