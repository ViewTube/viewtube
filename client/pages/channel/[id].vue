<template>
  <div>
    <Spinner v-if="$fetchState.pending" class="centered" />
    <div v-if="channel" class="channel">
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
      <div class="video-sections-container">
        <div
          v-for="(section, index) in channel.videoSections"
          :key="index"
          class="video-section-container"
        >
          <SectionTitle v-if="section.title" :title="section.title" />
          <div v-if="section.type === 'single'" class="single-video-section">
            <InlineVideo :video="section.video" />
          </div>
          <div v-if="section.type === 'multi'" class="multi-video-section">
            <component
              :is="element.type === 'video' ? 'VideoEntry' : 'PlaylistEntry'"
              v-for="(element, i) in section.elements"
              :key="i"
              :video="element"
              :playlist="element"
            />
          </div>
        </div>
      </div>
    </div>
    <Teleport to="body">
      <div v-if="channel" class="channel-title-sticky">
        <div v-if="channel.authorThumbnails" class="channel-sticky-thumbnail">
          <img :src="imgProxyUrl + channel.authorThumbnails[0].url" alt="Author Image" />
        </div>
        <div class="channel-sticky-name">
          <h1>{{ channel.author }}</h1>
          <BadgeButton class="scroll-top-btn" :click="onScrollTop"><UpIcon /></BadgeButton>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import UpIcon from 'vue-material-design-icons/ArrowUp.vue';
import { defineComponent, useMeta, useRoute } from '#imports';
import VideoEntry from '@/components/list/VideoEntry.vue';
import PlaylistEntry from '@/components/list/PlaylistEntry.vue';
import Banner from '@/components/channel/Banner.vue';
import Overview from '@/components/channel/Overview.vue';
import RelatedChannels from '@/components/channel/RelatedChannels.vue';
import ChannelDescription from '@/components/channel/ChannelDescription.vue';
import Spinner from '@/components/Spinner.vue';
import SubscribeButton from '@/components/buttons/SubscribeButton.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import InlineVideo from '@/components/list/InlineVideo.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import { useImgProxy } from '@/utilities/proxy';
import {useMessagesStore} from "~/store/messages";

export default defineComponent({
  name: 'Channel',
  components: {
    VideoEntry,
    Banner,
    Overview,
    RelatedChannels,
    ChannelDescription,
    Spinner,
    SubscribeButton,
    SectionTitle,
    PlaylistEntry,
    InlineVideo,
    BadgeButton,
    UpIcon
  },
  setup() {
    const imgProxy = useImgProxy();
    const config = useRuntimeConfig();
    const messagesStore = useMessagesStore();
    const route = useRoute();

    const onScrollTop = (): void => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const { data: channel, error } = useLazyFetch(
      `${config.public.apiUrl}channels/${route.params.id}`
    );

    watch(
      () => error,
      () => {
        let errorMessage = '';
        if (error.response && error.response.data) {
          errorMessage = error.response.data.message;
        }
        messagesStore.createMessage({
          type: 'error',
          title: 'Loading the channel failed',
          message: errorMessage
        });
      }
    );

    useMeta(() => ({
      title: channel.value ? `${channel.value.author} :: ViewTube` : 'ViewTube',
      meta: [
        {
          hid: 'description',
          vmid: 'descriptionMeta',
          name: 'description',
          content:
            channel.value && channel.value.description
              ? channel.value.description.substring(0, 100)
              : ''
        },
        {
          hid: 'ogTitle',
          property: 'og:title',
          content: channel.value ? `${channel.value.author} - ViewTube` : 'ViewTube'
        },
        {
          hid: 'ogImage',
          property: 'og:image',
          itemprop: 'image',
          content:
            channel.value && channel.value.authorThumbnails
              ? channel.value.authorThumbnails[0].url
              : ''
        },
        {
          hid: 'ogDescription',
          property: 'og:description',
          content:
            channel.value && channel.value.description
              ? channel.value.description.substring(0, 100)
              : ''
        }
      ]
    }));

    return {
      imgProxyUrl: imgProxy.url,
      channel,
      onScrollTop
    };
  },
  head: {}
});
</script>

<style lang="scss">
.visible {
  .channel-title-sticky {
    transform: translate3d(0, $header-height, 0);
  }
}

.channel-title-sticky {
  background-color: var(--bgcolor-main);
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: $header-height;
  overflow: hidden;
  z-index: 11;
  display: flex;
  flex-direction: row;
  transform: translate3d(0, 0, 0);
  transition: transform 300ms $dynamic-easing;
  box-shadow: $low-shadow;

  .channel-sticky-thumbnail {
    height: $header-height;
    margin: 0;
    padding: 0;

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
    padding: 0 15px;
  }
}

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
      }
    }
  }
}
</style>
