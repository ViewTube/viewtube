<template>
  <div class="channel-entry">
    <div class="channel-entry-background" />
    <nuxt-link class="channel-entry-thmb" :to="{ path: '/channel/' + channel.authorId }">
      <div v-if="!channel.authorThumbnails" class="fake-thmb">
        <h3>{{ channelNameToImgString() }}</h3>
      </div>
      <div v-if="channel.authorThumbnails" class="thmb-image-container">
        <img
          class="channel-entry-thmb-image"
          :src="commons.proxyUrl + channel.authorThumbnails[2].url"
          :alt="channel.author"
        />
      </div>
    </nuxt-link>
    <div class="channel-entry-info">
      <nuxt-link
        v-tippy="channel.author"
        class="channel-entry-title tooltip"
        :to="{ path: '/channel/' + channel.authorId }"
        >{{ channel.author }}</nuxt-link
      >
      <div class="channel-entry-stats">
        <p class="channel-entry-videocount">{{ channel.videoCount }} videos</p>
        <p v-if="channel.subCount" class="channel-entry-subcount">
          {{ channel.subCount.toLocaleString('en-US') }}
          subscribers
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Commons from '@/plugins/commons.js';

export default {
  name: 'ChannelEntry',
  props: {
    channel: Object
  },
  data: () => ({
    commons: Commons
  }),
  mounted() {},
  methods: {
    channelNameToImgString() {
      let initials = '';
      this.channel.author.split(' ').forEach(e => {
        initials += e.charAt(0);
      });
      return initials;
    }
  }
};
</script>

<style lang="scss">
.channel-entry {
  width: 175px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  justify-content: flex-start;
  z-index: 11;
  position: relative;

  .channel-entry-background {
    position: absolute;
    top: 10px;
    width: 175px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #34363b;
    z-index: 10;
    transition-duration: 300ms;
    transition-timing-function: $intro-easing;
    transition-property: box-shadow;
    z-index: 10;
  }

  .channel-entry-thmb {
    width: 175px;
    height: 175px;
    overflow: hidden;
    position: relative;
    box-shadow: $medium-shadow;
    margin: 0 auto;
    z-index: 11;

    .fake-thmb {
      overflow: hidden;
      background-color: var(--theme-color);
      height: 100%;
      width: 100%;
      display: flex;

      h3 {
        font-size: 6rem;
        white-space: normal;
        text-align: center;
        margin: auto;
      }
    }

    .thmb-image-container {
      position: relative;
      top: 50%;
      left: 0;
      transform: translateY(-50%);

      .channel-entry-thmb-image {
        width: 100%;
        display: block;
      }
    }
  }

  .channel-entry-info {
    padding: 10px 0 10px 0;
    font-family: $default-font;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: left;
    z-index: 11;

    .channel-entry-title {
      text-decoration: none;
      margin: 0;
      font-size: 0.9rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--title-color);
      padding: 6px 0 4px 0;
      font-weight: bold;
    }

    .channel-entry-stats {
      color: var(--subtitle-color);
      display: flex;
      width: 100%;
      justify-content: space-between;
      flex-direction: column;
      font-size: 0.8rem;
      margin: 3px 0 0 0;

      p {
        margin: 3px 0 5px 0;
      }
    }
  }

  // @media screen and (max-width: $mobile-width) {
  //   width: calc(100% - 20px);
  //   margin: 10px;

  //   .channel-entry-thmb {
  //     width: 100%;
  //     height: 53vw;

  //     .thmb-image-container {
  //       position: relative;
  //       top: 0;
  //       left: 0;
  //       transform: translateY(0);

  //       .channel-entry-thmb-image {
  //         top: 0;
  //         transform: translateY(0px);
  //       }
  //     }
  //   }
  // }
}
</style>
