<script setup lang="ts">
import { useUserStore } from '~/store/user';
import { useSettingsStore } from '~/store/settings';
import Logo from '~/components/Logo.vue';

const settingsStore = useSettingsStore();
const userStore = useUserStore();

const { data: homeFeedData, error: homeFeedError, pending: homeFeedLoading } = useGetHomeFeed();
</script>

<template>
  <div class="home" :class="{ loading: homeFeedLoading, error: homeFeedError }">
    <MetaPageHead
      title="ViewTube :: An alternative YouTube frontend"
      description="An alternative YouTube frontend"
    />
    <Spinner v-if="homeFeedLoading" class="centered" />
    <GithubHint />
    <ErrorPage v-if="homeFeedError" text="Error loading homepage. The API may not be reachable." />
    <HomeSubscriptions v-if="userStore.isLoggedIn && settingsStore.showHomeSubscriptions" />
    <HomeVideosContainer
      v-if="settingsStore.showHomeTrendingVideos && homeFeedData?.videos"
      :videos="homeFeedData?.videos"
      :short="settingsStore.showHomeSubscriptions"
    />

    <div
      v-if="
        !(userStore.isLoggedIn && settingsStore.showHomeSubscriptions) &&
        !settingsStore.showHomeTrendingVideos
      "
      class="home-search-container centered"
    >
      <Logo />
      <MainSearchBox />
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

  &.loading,
  &.error {
    height: calc(100vh - $header-height);
  }

  .section-title {
    max-width: $main-width;
    margin: 0 auto;
    .title {
      margin: 0 0 0 10px !important;
    }
  }
  .home-videos-container {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    padding: 0 10px;
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

  .home-search-container {
    display: flex;
    flex-direction: column;
    justify-content: center;

    width: calc(100% - 50px);
    max-width: $search-box-width;

    &.centered {
      top: calc(50% - $header-height);
    }

    .logo-link {
      justify-content: center;
      margin: 10px auto;
    }
  }
}
</style>
