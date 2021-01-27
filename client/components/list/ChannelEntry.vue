<template>
  <div class="channel-entry">
    <div class="channel-entry-background" />
    <nuxt-link
      class="channel-entry-thmb"
      :to="{ path: '/channel/' + (channel.authorId ? channel.authorId : channel.channelID) }"
    >
      <div v-if="!channel.authorThumbnails && !channel.avatars" class="fake-thmb">
        <h3>{{ channelNameToImgString() }}</h3>
      </div>
      <div v-if="channel.authorThumbnails" class="thmb-image-container">
        <img
          class="channel-entry-thmb-image"
          :src="proxyUrl + channel.authorThumbnails[2].url"
          :alt="channel.author"
        />
      </div>
      <div v-if="channel.avatars" class="thmb-image-container">
        <img
          class="channel-entry-thmb-image"
          :src="proxyUrl + channel.avatars[0].url"
          :alt="channel.author ? channel.author : channel.name"
        />
      </div>
    </nuxt-link>
    <div class="channel-entry-info">
      <div class="title-container">
        <nuxt-link
          v-tippy="channel.author ? channel.author : channel.name"
          class="channel-entry-title tooltip"
          :to="{ path: '/channel/' + (channel.authorId ? channel.authorId : channel.channelID) }"
          >{{ channel.author ? channel.author : channel.name }}</nuxt-link
        >
        <VerifiedIcon v-if="channel.verified" v-tippy="'Verified'" class="tooltip" title="" />
      </div>
      <div class="channel-entry-stats">
        <p class="channel-entry-videocount">
          {{ channel.videoCount ? channel.videoCount : channel.videos }} videos
        </p>
        <p v-if="channel.subCount" class="channel-entry-subcount">
          {{ channel.subCount.toLocaleString('en-US') }}
          subscribers
        </p>
        <p v-if="channel.subscribers" class="channel-entry-subcount">
          {{ channel.subscribers }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { commons } from '@/plugins/commons.ts';
import VerifiedIcon from 'vue-material-design-icons/CheckDecagram.vue';
import Vue from 'vue';

export default Vue.extend({
  name: 'ChannelEntry',
  components: { VerifiedIcon },
  props: {
    channel: Object
  },
  data: () => ({
    proxyUrl: commons.proxyUrl
  }),
  mounted() {},
  methods: {
    channelNameToImgString(): string {
      let initials = '';
      const channelName = this.channel.author ? this.channel.author : this.channel.name;
      channelName.split(' ').forEach((e: string) => {
        initials += e.charAt(0);
      });
      return initials;
    }
  }
});
</script>

<style lang="scss">
.channel-entry {
  width: 175px;
  display: flex;
  flex-direction: column;
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

    .title-container {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

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

      .material-design-icon {
        width: 16px;
        height: 16px;
        top: 6px;

        .material-design-icon__svg {
          width: 16px;
          height: 16px;
        }
      }
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
