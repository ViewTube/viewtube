<script setup lang="ts">
import Logo from '~/components/Logo.vue';
import { useSettingsStore } from '~/store/settings';
import { useUserStore } from '~/store/user';

const settingsStore = useSettingsStore();
const userStore = useUserStore();

const showPopularVideos = computed(() => settingsStore.showHomePopularVideos);

const {
  data: homeFeedData,
  error: homeFeedError,
  pending: homeFeedLoading,
  execute: loadHomeFeed
} = useGetHomeFeed(showPopularVideos);

// The feed is only requested when it is actually shown
watch(showPopularVideos, showVideos => {
  if (showVideos && !homeFeedData.value) loadHomeFeed();
});
</script>

<template>
  <div
    class="home"
    :class="{
      loading: showPopularVideos && homeFeedLoading,
      error: showPopularVideos && homeFeedError
    }"
  >
    <MetaPageHead
      title="ViewTube :: An alternative YouTube frontend"
      description="An alternative YouTube frontend"
    />
    <Spinner v-if="showPopularVideos && homeFeedLoading" class="centered" />
    <GithubHint />
    <ErrorPage
      v-if="showPopularVideos && homeFeedError"
      text="Error loading homepage. The API may not be reachable."
    />
    <HomeSubscriptions v-if="userStore.isLoggedIn && settingsStore.showHomeSubscriptions" />
    <HomeVideosContainer
      v-if="showPopularVideos && !homeFeedLoading && !homeFeedError"
      :videos="homeFeedData?.videos ?? []"
      :short="settingsStore.showHomeSubscriptions"
    />

    <div
      v-if="!(userStore.isLoggedIn && settingsStore.showHomeSubscriptions) && !showPopularVideos"
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
  margin-top: variables.$header-height;
  display: flex;
  flex-direction: column;

  &.loading,
  &.error {
    height: calc(100vh - variables.$header-height);
  }

  .section-title {
    max-width: variables.$main-width;
    margin: 0 auto;
    .title {
      margin: 0 0 0 10px !important;
    }
  }
  .home-videos-container {
    width: 100%;
    max-width: variables.$main-width;
    margin: 0 auto;
    padding: 0 10px;
    box-sizing: border-box;
    z-index: 10;
    background-color: var(--bgcolor-main);
    @include mixins.viewtube-grid;
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
    max-width: variables.$search-box-width;

    &.centered {
      top: calc(50% - variables.$header-height);
    }

    .logo-link {
      justify-content: center;
      margin: 10px auto;
    }
  }
}
</style>
