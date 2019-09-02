<template>
  <div class="channel" ref="channel">
    <vue-headful
      :title="(channel.author !== undefined ? channel.author : 'loading') + ' - ViewTube'"
    />
    <Spinner class="centered" v-if="loading"></Spinner>
    <div class="channel-banner" v-if="!loading" ref="parallaxParent">
      <div
        class="channel-banner-image"
        :style="{
          backgroundImage: `url(${channel.authorBanners[0].url})`,
          transform: `translateY(${bannerParallaxOffset}px)`
        }"
        ref="parallaxImage"
      ></div>
    </div>
    <div class="channel-information" v-if="!loading">
      <div class="channel-title-container">
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
            <SubscribeButton />
          </div>
        </div>
      </div>
      <div class="channel-description" v-html="channel.descriptionHtml"></div>
      <div class="related-channels">
        <div
          class="related-channel"
          v-for="channelEntry in channel.relatedChannels"
          :key="channelEntry.authorId"
        >
          <div class="related-channel-thumbnail">
            <router-link
              class="related-channel-thumbnail-image"
              :to="{path: '/channel/' + channelEntry.authorId}"
            >
              <img :src="channelEntry.authorThumbnails[5].url" alt />
            </router-link>
          </div>
          <div class="related-channel-info">
            <router-link
              class="related-channel-title"
              :to="{path: '/channel/' + channelEntry.authorId}"
            >{{ channelEntry.author }}</router-link>
          </div>
        </div>
      </div>
    </div>
    <div class="channel-videos-container" v-if="!loading">
      <VideoEntry v-for="video in channel.latestVideos" :key="video.videoId" :video="video"></VideoEntry>
    </div>
  </div>
</template>

<script>
import Commons from '@/commons.js'
import VideoEntry from '@/components/list/VideoEntry'
import Spinner from '@/components/Spinner'
import FamilyFriendly from 'vue-material-design-icons/AccountChild'
import Paid from 'vue-material-design-icons/CurrencyUsd'
import SubscribeButton from '@/components/SubscribeButton'

export default {
  name: 'home',
  components: {
    VideoEntry,
    Spinner,
    FamilyFriendly,
    Paid,
    SubscribeButton
  },
  data: function () {
    return {
      channel: [],
      loading: true,
      bannerParallaxOffset: 0
    }
  },
  methods: {
    getFormattedDate: rawDate => {
      let date = new Date(rawDate)
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
    },
    loadChannelData: function () {
      fetch(`${Commons.apiUrl}channels/${this.$route.params.id}`, {
        cache: 'force-cache'
      })
        .then(response => response.json())
        .then(data => {
          this.channel = data
          this.loading = false
        })
        .catch((error) => {
          return error
        })
    },
    handleScroll: function () {
      if (this.isVisible(this.$refs.parallaxImage)) {
        let offsetTop = this.$refs.parallaxParent.getBoundingClientRect().top - 60
        this.bannerParallaxOffset = offsetTop / -2
      }
    },
    isVisible: function (element) {
      let rect = element.getBoundingClientRect()
      let viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight)
      return !(rect.bottom < 0 || rect.top - viewHeight >= 0)
    }
  },
  watch: {
    '$route' (to, from) {
      this.loading = true
      this.loadChannelData()
    }
  },
  mounted: function () {
    this.loadChannelData()
    if (this.$refs.channel !== undefined) {
      this.$refs.channel.addEventListener('scroll', this.handleScroll)
    }
  },
  destroyed () {
    if (this.$refs.channel !== undefined) {
      this.$refs.channel.removeEventListener('scroll', this.handleScroll)
    }
  }
}
</script>

<style lang="scss">
.channel {
  display: flex;
  flex-direction: column;

  .channel-banner {
    height: calc(100vw / 3.5);
    min-height: 180px;
    width: 100%;
    overflow: hidden;

    .channel-banner-image {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
    }
  }
  .channel-information {
    width: 100%;
    box-sizing: border-box;
    z-index: 10;
    display: flex;
    flex-direction: column;

    .channel-title-container {
      background-color: $bgcolor-alt;

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
                color: $subtitle-color;
              }
            }
            .channel-subcount {
            }
            .channel-totalviews {
            }
            .channel-joined-on {
            }
            .channel-family-friendly,
            .channel-paid {
              display: flex;
              flex-direction: row;
              border-radius: 5px;

              span {
                margin: 0 10px 0 -5px;
                color: $theme-color;

                svg {
                  bottom: -0.1em !important;
                }
              }
              h2 {
                color: $theme-color;
              }
            }
          }
        }
      }
    }
    .channel-description {
      width: 100%;
      max-width: $main-width;
      box-sizing: border-box;
      z-index: 10;
      margin: 0 auto;
      padding: 10px;

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
      width: 100%;
      max-width: $main-width;
      box-sizing: border-box;
      z-index: 10;
      margin: 0 auto;
      padding: 10px;
      overflow-x: auto;
      white-space: nowrap;

      .related-channel {
        width: 90px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        display: inline-block;
        margin: 0 15px 0 0;

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
            color: $subtitle-color;
            font-family: $default-font;
            text-decoration: none;
            white-space: normal;
          }
        }
      }
    }
  }
  .channel-videos-container {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    z-index: 10;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;

    @media screen and (max-width: $mobile-width) {
      flex-direction: column;
    }
  }
}
</style>
