<template>
  <div
    class="channel"
    ref="channel"
  >
    <Banner
      class="banner"
      v-if="channel.authorBanners && channel.authorBanners.length > 0"
      :src="channel.authorBanners[1].url"
    />
    <Overview
      :channel="channel"
      class="overview"
    />
    <div class="backdrop-image">
      <ChannelDescription :descriptionHtml="channel.descriptionHtml" />
    </div>

    <RelatedChannels :channel="channel" />
    <div class="channel-videos-container">
      <div class="channel-title-sticky">
        <div class="channel-sticky-thumbnail">
          <img
            :src="commons.proxyUrl + channel.authorThumbnails[0].url"
            alt="Author Image"
          />
        </div>
        <div class="channel-sticky-name">
          <h1>{{ channel.author }}</h1>
        </div>
      </div>
      <div class="channel-videos">
        <VideoEntry
          v-for="video in channel.latestVideosShort"
          :key="video.videoId"
          :video="video"
        ></VideoEntry>
      </div>
    </div>
  </div>
</template>

<script>
import Commons from '@/plugins/commons.js'
import VideoEntry from '@/components/list/VideoEntry'
import Banner from '@/components/channel/Banner'
import Overview from '@/components/channel/Overview'
import RelatedChannels from '@/components/channel/RelatedChannels'
import ChannelDescription from '@/components/channel/ChannelDescription'
import Invidious from '@/plugins/services/invidious'

export default {
  name: 'home',
  components: {
    VideoEntry,
    Banner,
    Overview,
    RelatedChannels,
    ChannelDescription
  },
  head() {
    return {
      title: `${this.channel.author} - ViewTube`,
      link: [
        { rel: 'icon', type: 'image/x-icon', href: this.channel.authorThumbnails[0].url }
      ],
      meta: [
        { hid: 'description', vmid: 'descriptionMeta', name: 'description', content: this.channel.description.substring(0, 100) },
        { hid: 'ogTitle', property: 'og:title', content: `${this.channel.author} - ViewTube` },
        { hid: 'ogImage', property: 'og:image', itemprop: 'image', content: this.channel.authorThumbnails[0].url },
        { hid: 'ogDescription', property: 'og:description', content: this.channel.description.substring(0, 100) }
      ]
    }
  },
  data: () => ({
    channel: [],
    commons: Commons,
    overviewColor: 0
  }),
  asyncData({ params }) {
    return Invidious.api.channels({ id: params.id })
      .then(response => {
        const channel = response.data
        channel.latestVideosShort = channel.latestVideos.slice(0, 20)
        return { channel: response.data }
      })
      .catch(error => {
        console.error(error)
      })
  },
  methods: {
    handleScroll(e) {
      this.$emit('scroll', e)
    }
  }
}
</script>

<style lang="scss">
.channel {
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .banner {
    position: relative;
    margin-top: $header-height;
  }

  .backdrop-image {
    height: 100%;
    width: 100%;
    background-color: var(--bgcolor-main);
    z-index: 13;
  }

  .channel-videos-container {
    width: 100%;
    z-index: 9;
    max-width: $main-width;
    margin: 20px auto;
    display: block;

    .channel-title-sticky {
      background-color: var(--bgcolor-main);
      position: sticky;
      top: $header-height + 20px;
      transform: translateY(-$header-height - 20px);
      height: $header-height;
      overflow: hidden;
      z-index: +1;
      display: flex;
      flex-direction: row;
      margin: 5px;
      display: none;

      .channel-sticky-thumbnail {
        height: $header-height - 20px;
        margin: 0;
        padding: 10px;

        img {
          height: 100%;
        }
      }

      .channel-sticky-name {
        color: var(--title-color);
        font-family: $default-font;
        margin: 10px 0 10px 0;
        font-size: 0.8rem;
        margin: auto 0;
      }
    }
    .channel-videos {
      width: 100%;
      max-width: $main-width;
      margin: 80px auto 0 auto;
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
