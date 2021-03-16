<template>
  <div class="home">
    <GradientBackground :color="'theme'" />
    <SectionTitle
      v-if="userAuthenticated && subscriptions && subscriptions.length > 0"
      :title="'Subscriptions'"
      :link="'subscriptions'"
    />
    <div
      v-if="userAuthenticated && subscriptions && subscriptions.length > 0"
      class="home-videos-container small"
    >
      <VideoEntry
        v-for="video in subscriptions"
        :key="video.videoId"
        :video="video"
        :lazy="false"
      />
    </div>
    <SectionTitle :title="'Popular videos'" :gradient="!userAuthenticated" />
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
import VideoEntry from '@/components/list/VideoEntry.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import GradientBackground from '@/components/GradientBackground.vue';
import LoadMoreIcon from 'vue-material-design-icons/Reload.vue';
import ViewTubeApi from '@/plugins/services/viewTubeApi';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import { defineComponent, ref, useFetch, useMeta } from '@nuxtjs/composition-api';
import { useAccessor } from '~/store';
import { useAxios } from '~/plugins/axios';

export default defineComponent({
  name: 'Home',
  components: {
    VideoEntry,
    SectionTitle,
    GradientBackground,
    LoadMoreIcon,
    BadgeButton
  },
  setup() {
    const accessor = useAccessor();
    const axios = useAxios();

    const videos = ref([]);
    const displayedVideos = ref([]);
    const subscriptions = ref([]);
    const loading = ref(true);
    const userAuthenticated = ref(false);

    userAuthenticated.value = accessor.user.isLoggedIn;

    const showMoreVideos = (): void => {
      displayedVideos.value = videos.value;
    };

    const { fetch } = useFetch(async () => {
      const viewTubeApi = new ViewTubeApi(accessor.environment.apiUrl);
      await viewTubeApi.api
        .popular()
        .then((response: { data: { videos: any[] } }) => {
          videos.value = response.data.videos;
          displayedVideos.value = response.data.videos.slice(0, 8);
        })
        .catch((_: any) => {
          accessor.messages.createMessage({
            type: 'error',
            title: 'Error loading homepage',
            message: 'Click to try again',
            dismissDelay: 0,
            clickAction: () => fetch()
          });
        });
      if (userAuthenticated.value) {
        await axios
          .get(`${accessor.environment.apiUrl}user/subscriptions/videos?limit=4`, {
            withCredentials: true
          })
          .then(response => {
            subscriptions.value = response.data.videos;
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
      showMoreVideos
    };
  },
  head: {}
});
</script>

<style lang="scss">
.home {
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
