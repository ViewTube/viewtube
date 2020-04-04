<template>
  <div
    class="related-channels"
    v-show="channel.relatedChannels.length > 0"
  >
    <nuxt-link
      class="related-channel tooltip"
      v-ripple
      v-for="channelEntry in channel.relatedChannels"
      :data-tippy-content="channelEntry.author"
      :key="channelEntry.authorId"
      :to="{path: '/channel/' + channelEntry.authorId}"
    >
      <div class="related-channel-thumbnail">
        <div class="related-channel-thumbnail-image">
          <img :src="channelEntry.authorThumbnails[5].url" />
        </div>
      </div>
      <div class="related-channel-info">
        <p
          class="related-channel-title"
        >{{ channelEntry.author }}</p>
      </div>
    </nuxt-link>
  </div>
</template>

<script>
export default {
  name: 'related-channels',
  props: {
    channel: Object
  }
}
</script>

<style lang="scss" scoped>
.related-channels {
  width: 100%;
  min-height: 200px;
  max-width: $main-width;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 10px;
  overflow: auto hidden;
  scrollbar-width: thin;
  white-space: nowrap;
  z-index: 14;

  .related-channel {
    width: 90px;
    height: 140px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    display: inline-block;
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

      .related-channel-title {
        display: inline-block;
        width: 100%;
        color: var(--subtitle-color);
        font-family: $default-font;
        overflow: hidden;
        text-decoration: none;
        text-overflow: ellipsis;
        white-space: normal;
      }
    }
  }
}
</style>
