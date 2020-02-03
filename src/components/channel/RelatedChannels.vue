<template>
  <div class="related-channels" v-if="channel.relatedChannels.length > 0">
    <router-link
      class="related-channel"
      v-ripple
      v-for="channelEntry in channel.relatedChannels"
      :key="channelEntry.authorId"
      :to="{path: '/channel/' + channelEntry.authorId}"
    >
      <div class="related-channel-thumbnail">
        <div class="related-channel-thumbnail-image">
          <img :src="channelEntry.authorThumbnails[5].url" alt />
        </div>
      </div>
      <div class="related-channel-info">
        <router-link
          class="related-channel-title"
          :to="{path: '/channel/' + channelEntry.authorId}"
        >{{ channelEntry.author }}</router-link>
      </div>
    </router-link>
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
  background-color: var(--bgcolor-main);
  width: 100%;
  max-width: $main-width;
  box-sizing: border-box;
  z-index: 10;
  margin: 0 auto;
  padding: 10px;
  overflow-x: auto;
  scrollbar-width: thin;
  white-space: nowrap;
  z-index: 9;

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
