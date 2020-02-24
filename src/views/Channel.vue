<template>
  <div class="channel" ref="channel">
    <vue-headful
      :title="(channel.author !== undefined ? channel.author : 'loading') + ' - ViewTube'"
      :description="commons.description"
      :image="(channel.authorThumbnails !== undefined ? channel.authorThumbnails[0].url : '#')"
      lang="en"
    />
    <Banner
      v-if="channel.authorBanners && channel.authorBanners.length > 0"
      :src="commons.proxyUrl + channel.authorBanners[0].url"
    />
    <Overview :channel="channel" v-if="!loading" />
    <ChannelDescription :descriptionHtml="channel.descriptionHtml" v-if="!loading" />
    <RelatedChannels :channel="channel" v-if="!loading" />
    <div class="channel-videos-container" v-if="!loading">
      <div class="channel-title-sticky">
        <div class="channel-sticky-thumbnail">
          <img :src="commons.proxyUrl + channel.authorThumbnails[0].url" alt="Author Image" />
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
import Banner from '@/components/channel/Banner'
import Overview from '@/components/channel/Overview'
import RelatedChannels from '@/components/channel/RelatedChannels'
import ChannelDescription from '@/components/channel/ChannelDescription'

export default {
  name: 'home',
  components: {
    VideoEntry,
    Banner,
    Overview,
    RelatedChannels,
    ChannelDescription
  },
  data: () => ({
    channel: [],
    loading: true,
    commons: Commons
  }),
  beforeRouteEnter(to, from, next) {
    window.invidious.api.channels({
      id: to.params.id
    }).then(response => next(vm => vm.loadData(response.data)))
      .catch(error => {
        console.error(error)
        next(false, vm => {
          vm.$Progress.fail()
        })
      })
  },
  beforeRouteUpdate(to, from, next) {
    this.$Progress.start()
    const me = this
    window.invidious.api.channels({
      id: to.params.id
    }).then(response => next(me.loadData(response.data)))
      .catch(error => {
        console.error(error)
        next(false, vm => {
          vm.$Progress.fail()
        })
      })
  },
  methods: {
    handleScroll(e) {
      this.$emit('scroll', e)
    },
    loadData(data) {
      this.channel = data
      this.loading = false
      this.$Progress.finish()
    }
  }
}
</script>

<style lang="scss">
.channel {
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: scroll;
  perspective: 4px;
  perspective-origin: 0 0;
  margin-top: $header-height;
  height: 100%;

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
