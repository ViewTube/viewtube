<template>
  <div class="overwiew">
    <div ref="channelTitle" class="channel-title-container">
      <div class="channel-title">
        <div class="channel-thumbnail">
          <img
            :src="channel.authorThumbnails[3].url"
            alt="Author Image"
          />
        </div>
        <div class="channel-info">
          <div class="channel-name">
            <h1>{{ channel.author }}</h1>
          </div>
          <div class="channel-basics">
            <div class="channel-subcount">
              <h2>
                {{
                  channel.subCount.toLocaleString('en-US')
                }}
                subscribers
              </h2>
            </div>
            <div class="channel-totalviews">
              <h2>
                {{
                  channel.totalViews.toLocaleString('en-US')
                }}
                total views
              </h2>
            </div>
            <div class="channel-joined-on">
              <h2>
                joined
                {{
                  getFormattedDate(
                    new Date(channel.joined * 1000)
                  )
                }}
              </h2>
            </div>
            <div
              v-if="channel.isFamilyFriendly"
              class="channel-family-friendly"
            >
              <FamilyFriendly />
              <h2>family friendly</h2>
            </div>
            <div v-if="channel.paid" class="channel-paid">
              <Paid />
              <h2>paid</h2>
            </div>
          </div>
          <SubscribeButton :channel-id="channel.authorId" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FamilyFriendly from 'vue-material-design-icons/AccountChild';
import Paid from 'vue-material-design-icons/CurrencyUsd';
import SubscribeButton from '@/components/buttons/SubscribeButton';

export default {
  name: 'ChannelOverview',
  components: {
    SubscribeButton,
    FamilyFriendly,
    Paid
  },
  props: {
    channel: Object
  },
  methods: {
    getFormattedDate(rawDate) {
      const date = new Date(rawDate);
      return `${date.getDate()}.${
        date.getMonth() + 1
      }.${date.getFullYear()}`;
    }
  }
};
</script>

<style lang="scss">
.overwiew {
  width: 100%;
  box-sizing: border-box;
  z-index: 14;
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
}
</style>
