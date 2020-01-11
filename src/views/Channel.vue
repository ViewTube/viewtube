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
      :src="channel.authorBanners[0].url"
    />
    <Overview :channel="channel" v-if="!loading" />
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
import Banner from '@/components/channel/Banner'
import Overview from '@/components/channel/Overview'

export default {
  name: 'home',
  components: {
    VideoEntry,
    Banner,
    Overview
  },
  data: () => ({
    channel: [],
    loading: true,
    commons: Commons,
    parallaxScroll: 0,
    parallaxTicking: false
  }),
  beforeRouteEnter(to, from, next) {
    fetch(`${Commons.getApiUrl()}channels/${to.params.id}`, {
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
  beforeRouteUpdate(to, from, next) {
    this.$Progress.start()
    let me = this
    fetch(`${Commons.getApiUrl()}channels/${to.params.id}`, {
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
    handleScroll(e) {
      this.$emit('scroll', e)
    },
    loadData (data) {
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
