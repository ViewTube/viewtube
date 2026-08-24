<script setup lang="ts">
import type { ApiDto } from '@viewtube/shared';
import BadgeButton from '~/components/buttons/BadgeButton.vue';
import VideoEntry from '~/components/list/VideoEntry.vue';
import { useUserStore } from '~/store/user';

const props = defineProps<{
  videos: ApiDto<'HomeFeedDto'>['videos'];
  short?: boolean;
}>();

const showMore = ref(false);
const userStore = useUserStore();

const displayedVideos = computed(() => {
  if (!props.videos) return [];
  if (showMore.value) return props.videos;

  let videoCount = 12;
  if (userStore.isLoggedIn && props.short) {
    videoCount = 8;
  }
  return props.videos.slice(0, videoCount);
});

const showMoreVideos = (): void => {
  showMore.value = true;
};
</script>

<template>
  <SectionTitle v-if="videos?.length > 0" :title="'Popular videos'" />
  <div v-if="videos?.length > 0" class="home-videos-container small">
    <VideoEntry v-for="video in displayedVideos" :key="video.id" :lazy="true" :video="video" />
  </div>
  <div v-else class="no-videos">
    <VTIcon name="mdi:video-off" />
    <p>Couldn't load any videos right now. Try again later, or use the search instead.</p>
  </div>
  <div class="home-show-more">
    <BadgeButton
      v-if="videos?.length > 0 && displayedVideos.length !== videos?.length"
      :click="showMoreVideos"
    >
      <VTIcon name="mdi:reload" />
      <p>Show more</p>
    </BadgeButton>
  </div>
</template>

<style lang="scss" scoped>
.no-videos {
  margin: 0 auto;
  display: grid;
  justify-items: center;
  gap: 5px;
}
</style>
