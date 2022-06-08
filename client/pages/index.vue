<template>
  <div class="home" :class="{ loading: popularPageLoading || displayedVideos.length <= 0 }">
    <Spinner v-if="popularPageLoading" class="centered" />
    <GradientBackground :color="'theme'" />
    <SectionTitle
      v-if="settingsStore.showHomeSubscriptions && userAuthenticated"
      :title="'Subscriptions'"
      :link="'subscriptions'"
    />
    <Spinner v-if="subscriptionsLoading" />
    <div
      v-if="
        settingsStore.showHomeSubscriptions &&
        userAuthenticated &&
        subscriptions &&
        subscriptions.length > 0
      "
      class="home-videos-container small"
    >
      <VideoEntry v-for="video in subscriptions" :key="video.videoId" :video="video" :lazy="true" />
    </div>
    <SectionTitle :title="'Popular videos'" :gradient="!userAuthenticated" z />
    <div class="home-videos-container small">
      <VideoEntry
        v-for="(video, index) in displayedVideos"
        :key="index"
        :lazy="true"
        :video="video"
      />
    </div>
    <BadgeButton
      v-if="displayedVideos.length !== videoData?.videos?.length"
      :click="showMoreVideos"
      class="home-show-more"
    >
      <LoadMoreIcon />
      <p>Show more</p>
    </BadgeButton>
  </div>
</template>

<script lang="ts">
import LoadMoreIcon from 'vue-material-design-icons/Reload.vue';
import { defineComponent, ref } from '#imports';
import VideoEntry from '@/components/list/VideoEntry.vue';
import Spinner from '@/components/Spinner.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import GradientBackground from '@/components/GradientBackground.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import { useMessagesStore } from '~/store/messages';
import { useUserStore } from '~~/store/user';
import { useSettingsStore } from '~~/store/settings';

export default defineComponent({
  name: 'Home',
  components: {
    VideoEntry,
    SectionTitle,
    GradientBackground,
    LoadMoreIcon,
    BadgeButton,
    Spinner
  },
  layout: 'default',
  setup() {
    const messagesStore = useMessagesStore();
    const settingsStore = useSettingsStore();
    const userStore = useUserStore();

    const showMore = ref(false);
    const userAuthenticated = ref(userStore.isLoggedIn);

    const displayedVideos = computed(() => {
      if (videoData.value?.videos) {
        if (!showMore.value) {
          let videoCount = 12;
          if (userAuthenticated.value && settingsStore.showHomeSubscriptions) {
            videoCount = 8;
          }
          return videoData.value.videos.slice(0, videoCount);
        }
        return videoData.value.videos;
      }
      return [];
    });

    const showMoreVideos = (): void => {
      showMore.value = true;
    };

    const {
      data: videoData,
      error: popularPageError,
      pending: popularPageLoading
    } = useGetPopularPage();

    const { data: subscriptions, pending: subscriptionsLoading } = useGetUserSubscriptions({
      limit: 4
    });

    watch(popularPageError, newValue => {
      if (newValue) {
        messagesStore.createMessage({
          type: 'error',
          title: 'Error loading homepage',
          message: 'Refresh the page to try again',
          dismissDelay: 0
        });
      }
    });

    useHead({
      title: `ViewTube :: An alternative YouTube frontend`
    });

    return {
      videoData,
      displayedVideos,
      subscriptions,
      popularPageLoading,
      subscriptionsLoading,
      userAuthenticated,
      showMoreVideos,
      settingsStore
    };
  },
  head: {}
});
</script>

<style lang="scss">
.spinner {
  z-index: 11;

  &:not(.centered) {
    position: relative;
  }
}
.home {
  &.loading {
    height: 100vh;
  }

  .section-title {
    max-width: $main-width;
    margin: 0 auto;
    .title {
      margin: 0 0 0 15px !important;
    }
  }
  .home-videos-container {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    padding: 0 15px;
    box-sizing: border-box;
    z-index: 10;
    background-color: var(--bgcolor-main);
    @include viewtube-grid;
  }

  .home-show-more {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 20px;
  }
}
</style>
