<script setup lang="ts">
import LoadMoreIcon from 'vue-material-design-icons/Reload.vue';
import VideoEntry from '@/components/list/VideoEntry.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import { useUserStore } from '@/store/user';
import { useSettingsStore } from '@/store/settings';

const settingsStore = useSettingsStore();
const userStore = useUserStore();

const showMore = ref(false);

const displayedVideos = computed(() => {
  if (videoData.value?.videos) {
    if (!showMore.value) {
      let videoCount = 12;
      if (userStore.isLoggedIn && settingsStore.showHomeSubscriptions) {
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
</script>

<template>
  <div class="home" :class="{ loading: popularPageLoading || displayedVideos.length <= 0 }">
    <MetaPageHead
      title="ViewTube :: An alternative YouTube frontend"
      description="An alternative YouTube frontend"
    />
    <Spinner v-if="popularPageLoading" class="centered" />
    <ErrorPage
      v-if="popularPageError"
      text="Error loading homepage. The API may not be reachable."
    />
    <HomeSubscriptions v-if="userStore.isLoggedIn && settingsStore.showHomeSubscriptions" />
    <SectionTitle v-if="videoData?.videos?.length > 0" :title="'Popular videos'" />
    <div class="home-videos-container small">
      <VideoEntry
        v-for="(video, index) in displayedVideos"
        :key="index"
        :lazy="true"
        :video="video"
      />
    </div>
    <div class="home-show-more">
      <BadgeButton
        v-if="videoData?.videos?.length > 0 && displayedVideos.length !== videoData?.videos?.length"
        :click="showMoreVideos"
      >
        <LoadMoreIcon />
        <p>Show more</p>
      </BadgeButton>
    </div>
  </div>
</template>

<style lang="scss">
.spinner {
  z-index: 11;

  &:not(.centered) {
    position: relative;
  }
}
.home {
  margin-top: $header-height;
  display: flex;
  flex-direction: column;

  &.loading {
    height: calc(100vh - $header-height);
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
    margin: 20px 0;
    display: grid;
    justify-items: center;
  }
}
</style>
