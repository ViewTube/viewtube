<template>
  <div>
    <div v-if="loading" class="loading-channel">
      <Spinner />
      <h2>Loading channel...</h2>
      <p>This can take up to 20 seconds</p>
    </div>
    <div v-if="!loading && channel" ref="channel" class="channel">
      <Banner
        v-if="channel && channel.authorBanners && channel.authorBanners.length > 0"
        class="banner"
        :src="channel.authorBanners[1].url"
        :banner-links="channel.channelLinks"
        :banner-hq-src="channel.authorBanners[channel.authorBanners.length - 1].url"
      />
      <Overview :channel="channel" class="overview" />
      <div class="backdrop-image">
        <ChannelDescription :description="channel.description" />
        <RelatedChannels :channel="channel" />
      </div>
      <div class="channel-title-sticky" :class="{ top: $store.state.scroll.scrollDown }">
        <div v-if="channel.authorThumbnails" class="channel-sticky-thumbnail">
          <img :src="commons.proxyUrl + channel.authorThumbnails[2].url" alt="Author Image" />
        </div>
        <div class="channel-sticky-name">
          <h1>{{ channel.author }}</h1>
          <SubscribeButton :channel-id="channel.authorId" />
        </div>
      </div>
      <div class="video-sections-container">
        <div
          v-for="(section, index) in channel.videoSections"
          :key="index"
          class="video-section-container"
        >
          <div v-if="section.type === 'single'" class="single-video-section" />
          <div v-if="section.type === 'multi'" class="multi-video-section">
            <VideoEntry v-for="video in section.videos" :key="video.videoId" :video="video" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Commons from '@/plugins/commons.js';
import VideoEntry from '@/components/list/VideoEntry';
import Banner from '@/components/channel/Banner';
import Overview from '@/components/channel/Overview';
import RelatedChannels from '@/components/channel/RelatedChannels';
import ChannelDescription from '@/components/channel/ChannelDescription';
import Spinner from '@/components/Spinner';
import SubscribeButton from '@/components/buttons/SubscribeButton';
import ViewTubeApi from '~/plugins/services/viewTubeApi';

export default {
  name: 'Home',
  components: {
    VideoEntry,
    Banner,
    Overview,
    RelatedChannels,
    ChannelDescription,
    Spinner,
    SubscribeButton
  },
  data: () => ({
    channel: null,
    commons: Commons,
    overviewColor: 0,
    loading: true
  }),
  mounted() {
    const { params, store } = this.$nuxt.context;
    const viewTubeApi = new ViewTubeApi(store.getters['environment/apiUrl']);
    viewTubeApi.api
      .channels({ id: params.id })
      .then(response => {
        this.channel = response.data;
        this.loading = false;
        document.title = `${this.channel.author} :: ViewTube`;
      })
      .catch(error => {
        this.$store.dispatch('messages/createMessage', {
          type: 'error',
          title: 'Loading the channel failed',
          message: error.response.data.message
        });
      });
  },
  methods: {
    handleScroll(e) {
      this.$emit('scroll', e);
    }
  },
  head() {
    return {
      title: `loading channel :: ViewTube`
      //   meta: [
      //     {
      //       hid: 'description',
      //       vmid: 'descriptionMeta',
      //       name: 'description',
      //       content: this.channel.description.substring(0, 100)
      //     },
      //     {
      //       hid: 'ogTitle',
      //       property: 'og:title',
      //       content: `${this.channel.author} - ViewTube`
      //     },
      //     {
      //       hid: 'ogImage',
      //       property: 'og:image',
      //       itemprop: 'image',
      //       content: this.channel.authorThumbnails[0].url
      //     },
      //     {
      //       hid: 'ogDescription',
      //       property: 'og:description',
      //       content: this.channel.description.substring(0, 100)
      //     }
      //   ]
    };
  }
};
</script>

<style lang="scss">
.loading-channel {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

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

  .channel-title-sticky {
    background-color: var(--bgcolor-main);
    position: fixed;
    top: 0;
    width: 100%;
    height: $header-height;
    overflow: hidden;
    z-index: 11;
    display: flex;
    flex-direction: row;
    transform: translate3d(0, $header-height, 0);
    transition: transform 300ms $dynamic-easing;
    box-shadow: $low-shadow;

    &.top {
      transform: translate3d(0, 0, 0);
    }

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
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      flex-grow: 1;
      padding: 0 15px 0 0;
    }
  }

  .video-sections-container {
    width: 100%;
    z-index: 9;
    max-width: $main-width;
    margin: 0 auto;
    display: block;
    padding: 15px;
    box-sizing: border-box;

    .video-section-container {
      .multi-video-section {
        width: 100%;
        max-width: $main-width;
        margin: 0 auto;
        z-index: 10;
        @include viewtube-grid;

        @media screen and (max-width: $mobile-width) {
          flex-direction: column;
        }
      }
    }
  }
}
</style>
