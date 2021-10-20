<template>
  <div class="home" :class="{ loading: $fetchState.pending || displayedVideos.length <= 0 }">
    <Spinner v-if="$fetchState.pending" class="centered" />
    <GradientBackground :color="'theme'" />
    <SectionTitle
      v-if="$accessor.settings.showHomeSubscriptions && userAuthenticated"
      :title="'Subscriptions'"
      :link="'subscriptions'"
    />
    <Spinner v-if="subscriptionsLoading" />
    <div
      v-if="
        $accessor.settings.showHomeSubscriptions &&
        userAuthenticated &&
        subscriptions &&
        subscriptions.length > 0
      "
      class="home-videos-container small"
    >
      <VideoEntry
        v-for="video in subscriptions"
        :key="video.videoId"
        :video="video"
        :lazy="true"
      />
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
      v-if="displayedVideos.length !== videos.length"
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
import { defineComponent, ref, useFetch, useMeta } from '@nuxtjs/composition-api';
import VideoEntry from '@/components/list/VideoEntry.vue';
import Spinner from '@/components/Spinner.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import GradientBackground from '@/components/GradientBackground.vue';
import ViewTubeApi from '@/plugins/services/viewTubeApi';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import { useAccessor } from '@/store';
import { useAxios } from '@/plugins/axiosPlugin';

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
  setup() {
    const accessor = useAccessor();
    const axios = useAxios();

    const videos = ref([]);
    const displayedVideos = ref([]);
    const subscriptions = ref([]);
    const loading = ref(true);
    const subscriptionsLoading = ref(false);
    const userAuthenticated = ref(false);

    userAuthenticated.value = accessor.user.isLoggedIn;

    const showMoreVideos = (): void => {
      displayedVideos.value = videos.value;
    };

    useFetch(async () => {
      const viewTubeApi = new ViewTubeApi(accessor.environment.apiUrl);
      await viewTubeApi.api
        .popular()
        .then((response: { data: { videos: any[] } }) => {
          videos.value = response.data.videos;
          let videoCount = 12;
          if (userAuthenticated.value && accessor.settings.showHomeSubscriptions) {
            videoCount = 8;
          }
          displayedVideos.value = response.data.videos.slice(0, videoCount);
        })
        .catch((_: any) => {
          accessor.messages.createMessage({
            type: 'error',
            title: 'Error loading homepage',
            message: 'Refresh the page to try again',
            dismissDelay: 0
          });
        });
      if (userAuthenticated.value && accessor.settings.showHomeSubscriptions) {
        subscriptionsLoading.value = true;
        await axios
          .get(`${accessor.environment.apiUrl}user/subscriptions/videos?limit=4`, {
            withCredentials: true
          })
          .then(response => {
            subscriptions.value = response.data.videos;
            subscriptionsLoading.value = false;
          })
          .catch(_ => {});
      }
    });

    useMeta(() => ({
      title: `ViewTube :: An alternative YouTube frontend`
    }));

    return {
      videos,
      displayedVideos,
      subscriptions,
      loading,
      userAuthenticated,
      subscriptionsLoading,
      showMoreVideos
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
