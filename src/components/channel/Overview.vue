<template>
  <div class="overwiew">
    <div class="channel-title-container" ref="channelTitle">
      <div class="channel-title">
        <div class="channel-thumbnail">
          <img :src="channel.authorThumbnails[0].url" alt="Author Image" />
        </div>
        <div class="channel-info">
          <div class="channel-name">
            <h1>{{ channel.author }}</h1>
          </div>
          <div class="channel-basics">
            <div class="channel-subcount">
              <h2>{{ channel.subCount.toLocaleString() }} subscribers</h2>
            </div>
            <div class="channel-totalviews">
              <h2>{{ channel.totalViews.toLocaleString() }} total views</h2>
            </div>
            <div class="channel-joined-on">
              <h2>joined {{ getFormattedDate(new Date(channel.joined*1000)) }}</h2>
            </div>
            <div class="channel-family-friendly" v-if="channel.isFamilyFriendly">
              <FamilyFriendly />
              <h2>family friendly</h2>
            </div>
            <div class="channel-paid" v-if="channel.paid">
              <Paid />
              <h2>paid</h2>
            </div>
          </div>
          <SubscribeButton :channelId="channel.authorId" />
        </div>
      </div>
    </div>
    <div
      class="channel-description"
      v-if="channel.description.length > 0"
      v-html="channel.descriptionHtml"
    ></div>
    <div class="related-channels" v-if="channel.relatedChannels.length > 0">
      <router-link
        class="related-channel"
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
  </div>
</template>

<script>
import SubscribeButton from '@/components/buttons/SubscribeButton'
import FamilyFriendly from 'vue-material-design-icons/AccountChild'
import Paid from 'vue-material-design-icons/CurrencyUsd'

export default {
  name: 'channel-overview',
  components: {
    SubscribeButton,
    FamilyFriendly,
    Paid
  },
  props: {
    channel: Object
  },
  methods: {
    getFormattedDate: rawDate => {
      let date = new Date(rawDate)
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
    }
  }
}
</script>

<style lang="scss">
.overwiew {
  width: 100%;
  box-sizing: border-box;
  z-index: 10;
  display: flex;
  flex-direction: column;

  .channel-title-container {
    background-color: var(--bgcolor-alt);
    z-index: 10;
    padding: 0 0 10px 0;

    .channel-title {
      display: flex;
      flex-direction: row;
      max-width: $main-width;
      position: relative;
      left: 50%;
      transform: translateX(-50%);

      .channel-thumbnail {
        height: 110px;
        margin: 0;
        padding: 10px;

        img {
          height: 100%;
        }
      }
      .channel-info {
        display: flex;
        flex-direction: column;

        .channel-name {
          margin: 10px 0 10px 0;
          font-size: 0.8rem;
        }
        .channel-basics {
          margin: 0;
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;

          div {
            margin: 0 15px 10px 0;

            h2 {
              font-family: $default-font;
              font-size: 1rem;
              color: var(--subtitle-color);
            }
          }
          .channel-family-friendly,
          .channel-paid {
            display: flex;
            flex-direction: row;
            border-radius: 5px;

            span {
              margin: 0 10px 0 -5px;
              color: var(--theme-color);

              svg {
                bottom: -0.1em !important;
              }
            }
            h2 {
              color: var(--theme-color);
            }
          }
        }
      }
    }
  }
  .channel-description {
    background-color: var(--bgcolor-main);
    width: 100%;
    max-width: $main-width;
    box-sizing: border-box;
    z-index: 10;
    margin: 0 auto;
    padding: 20px 10px;
    z-index: 9;

    pre {
      font-family: unset;
      color: unset;
      width: unset;
      padding: unset;
      margin: unset;
      white-space: pre-wrap;
    }
  }
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
      box-shadow: 0 0 0 2px var(--theme-color);
      border-radius: 3px;
      transition: background-color 300ms $intro-easing;

      &:hover {
        background-color: var(--bgcolor-alt)
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
}
</style>
