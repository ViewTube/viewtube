<template>
  <div class="channel" ref="channel">
    <vue-headful
      :title="(channel.author !== undefined ? channel.author : 'loading') + ' - ViewTube'"
      :description="commons.description"
      :image="(channel.authorThumbnails !== undefined ? channel.authorThumbnails[0].url : '#')"
      lang="en"
    />
    <div class="channel-banner" v-if="!loading" ref="parallaxParent">
      <div
        class="channel-banner-image"
        :style="{
          backgroundImage: `url(${channel.authorBanners[0].url})`
        }"
        ref="parallaxImage"
      ></div>
    </div>
    <div class="channel-information" v-if="!loading" ref="channelInformation">
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
            <SubscribeButton />
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
    <div class="channel-videos-container" v-if="!loading">
      <div class="channel-title-sticky">
        <div class="channel-sticky-thumbnail">
          <img :src="channel.authorThumbnails[0].url" alt="Author Image" />
        </div>
        <div class="channel-sticky-name">
          <h1>{{ channel.author }}</h1>
        </div>
      </div>
      <div class="channel-videos">
        <VideoEntry v-for="video in channel.latestVideos" :key="video.videoId" :video="video"></VideoEntry>
      </div>
    </div>
  </div>
</template>

<script>
import Commons from '@/commons.js'
import VideoEntry from '@/components/list/VideoEntry'
// import Spinner from '@/components/Spinner'
import FamilyFriendly from 'vue-material-design-icons/AccountChild'
import Paid from 'vue-material-design-icons/CurrencyUsd'
import SubscribeButton from '@/components/SubscribeButton'

export default {
  name: 'home',
  components: {
    VideoEntry,
    // Spinner,
    FamilyFriendly,
    Paid,
    SubscribeButton
  },
  data: function () {
    return {
      channel: [],
      loading: true,
      commons: Commons
    }
  },
  beforeRouteEnter: function (to, from, next) {
    fetch(`${Commons.apiUrl}channels/${to.params.id}`, {
      cache: 'force-cache',
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        next(vm => vm.loadData(data))
      })
      .catch(error => {
        console.error(error)
        next(false, vm => vm.$Progress.fail())
      })
  },
  beforeRouteUpdate: function (to, from, next) {
    this.$Progress.start()
    let me = this
    fetch(`${Commons.apiUrl}channels/${to.params.id}`, {
      cache: 'force-cache',
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        me.channel = data
        me.loading = false
        me.$Progress.finish()
        next()
      })
      .catch(error => {
        console.error(error)
        next(vm => vm.$Progress.fail())
      })
  },
  methods: {
    loadData: function (data) {
      this.channel = data
      this.loading = false
      this.$Progress.finish()
    },
    getFormattedDate: rawDate => {
      let date = new Date(rawDate)
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
    },
    handleScroll: function () {
      if (this.isVisible(this.$refs.parallaxImage)) {
        let offsetTop = this.$refs.parallaxParent.getBoundingClientRect().top - 60
        let bannerParallaxOffset = offsetTop / -1.5
        if (document.getElementsByClassName('channel-banner-image')) {
          document.getElementsByClassName('channel-banner-image')[0].style.transform = `translate3d(0,${bannerParallaxOffset}px,0)`
        }
      }
    },
    isVisible: function (element) {
      let rect = element.getBoundingClientRect()
      let viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight)
      return !(rect.bottom < 0 || rect.top - viewHeight >= 0)
    }
  },
  mounted: function () {
    if (this.$refs.channel !== undefined) {
      this.$refs.channel.addEventListener('scroll', this.handleScroll)
    }
  },
  destroyed() {
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
      will-change: transform;
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
      position: sticky;
      top: 0;
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
      background-color: $bgcolor-main;
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
      background-color: $bgcolor-main;
      width: 100%;
      max-width: $main-width;
      box-sizing: border-box;
      z-index: 10;
      margin: 0 auto;
      padding: 10px;
      overflow-x: auto;
      scrollbar-width: none;
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
        box-shadow: 0 0 0 2px $theme-color;
        border-radius: 3px;
        transition: background-color 300ms $intro-easing;

        &:hover {
          background-color: $bgcolor-alt;
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
            color: $subtitle-color;
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
  .channel-videos-container {
    width: 100%;
    z-index: 9;
    max-width: $main-width;
    margin: 20px auto;
    display: block;

    .channel-title-sticky {
      background-color: $bgcolor-main;
      position: sticky;
      top: $header-height + 20px;
      transform: translateY(-$header-height - 20px);
      height: $header-height;
      overflow: hidden;
      z-index: 10;
      display: flex;
      flex-direction: row;
      margin: 5px;

      .channel-sticky-thumbnail {
        height: $header-height - 20px;
        margin: 0;
        padding: 10px;

        img {
          height: 100%;
        }
      }
      .channel-sticky-name {
        color: $title-color;
        font-family: $default-font;
        margin: 10px 0 10px 0;
        font-size: 0.8rem;
        margin: auto 0;
      }
    }
    .channel-videos {
      width: 100%;
      max-width: $main-width;
      margin: 0 auto;
      z-index: 10;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-evenly;
      z-index: 9;
      transform: translateY(-80px);

      @media screen and (max-width: $mobile-width) {
        flex-direction: column;
      }
    }
  }
}
</style>
