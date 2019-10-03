<template>
  <div class="channel-entry">
    <router-link class="channel-entry-thmb" :to="{path: '/channel/' + channel.authorId}">
      <div class="thmb-image-container">
        <img class="channel-entry-thmb-image" :src="channel.authorThumbnails[2].url" />
      </div>
    </router-link>
    <div class="channel-entry-info">
      <router-link
        class="channel-entry-title tooltip"
        :to="{path: '/channel/' + channel.authorId}"
        :data-tippy-content="channel.author"
      >{{ channel.author }}</router-link>
      <div class="channel-entry-stats">
        <p class="channel-entry-videocount">{{ channel.videoCount }} videos</p>
        <p class="channel-entry-subcount">{{ channel.subCount.toLocaleString() }} subscribers</p>
      </div>
    </div>
  </div>
</template>

<script>
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

export default {
  name: 'channel-entry',
  props: {
    channel: Object
  },
  mounted () {
    tippy('.tooltip', {
      duration: 300,
      arrow: false,
      delay: [500, 100],
      touch: 'hold',
      placement: 'bottom'
    })
  }
}
</script>

<style lang="scss">
.channel-entry {
  width: 220px;
  display: flex;
  flex-direction: column;
  margin: 10px;
  justify-content: flex-start;
  overflow: hidden;
  box-sizing: border-box;

  .channel-entry-thmb {
    width: 100%;
    height: calc((220px * 9) / 16);
    overflow: hidden;
    position: relative;
    margin: 0 auto;

    .thmb-image-container {
      height: 100%;
      display: flex;

      .channel-entry-thmb-image {
        height: 100%;
        margin: auto;
      }
    }
  }

  .channel-entry-info {
    padding: 0 0 10px 0;
    font-family: $default-font;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: left;

    .channel-entry-title {
      text-decoration: none;
      margin: 0;
      font-size: 0.9rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: $title-color;
      padding: 6px 0 4px 0;
    }

    .channel-entry-stats {
      color: $subtitle-color;
      display: flex;
      width: 100%;
      justify-content: space-between;
      flex-direction: column;
      font-size: 0.8rem;
      margin: 5px 0 0 0;

      p {
        margin: 0 0 5px 0;
      }
    }
  }

  @media screen and (max-width: $mobile-width) {
    width: calc(100% - 20px);
    margin: 10px;

    .channel-entry-thmb {
      width: 100%;
      height: unset;

      .thmb-image-container {
        position: relative;
        top: 0;
        left: 0;
        transform: translateY(0);

        .channel-entry-thmb-image {
          top: 0;
          transform: translateY(0px);
        }
      }
    }
  }
}
</style>
