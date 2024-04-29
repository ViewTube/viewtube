<script setup lang="ts">

import BadgeButton from '@/components/buttons/BadgeButton.vue';
import VideoEntry from '@/components/list/VideoEntry.vue';
import { useSettingsStore } from '@/store/settings';

const settingsStore = useSettingsStore();
const { data: subscriptions, pending: subscriptionsLoading } = useGetUserSubscriptions({
  limit: 20
});

const showMore = ref(false);
const displayedSubscriptions = computed(() => {
  if (subscriptions && subscriptions.value.videos) {
    if (!settingsStore.showHomeTrendingVideos) {
      return subscriptions.value.videos;
    }

    if (!showMore.value) {
      return subscriptions.value.videos.slice(0, 4);
    }

    return subscriptions.value.videos;
  }
  return [];
});
const showMoreSubscriptions = (): void => {
  showMore.value = true;
};
</script>

<template>
  <SectionTitle :title="'Subscriptions'" :link="'subscriptions'" />
  <Spinner v-if="subscriptionsLoading" />
  <div v-if="displayedSubscriptions.length > 0" class="home-videos-container small">
    <VideoEntry
      v-for="video in displayedSubscriptions"
      :key="video.videoId"
      :video="video"
      :lazy="true"
    />
  </div>
  <div v-if="subscriptions?.videos?.length > 0 && settingsStore.showHomeTrendingVideos" class="home-show-more">
    <BadgeButton
      v-if="displayedSubscriptions.length !== subscriptions?.videos?.length"
      :click="showMoreSubscriptions">
      <VTIcon name="mdi:reload" />
      <p>Show more</p>
    </BadgeButton>
  </div>
  <div v-if="subscriptions?.videos?.length === 0" class="no-subscriptions">
    <VTIcon name="mdi:youtube-subscription" />
    <p>No subscriptions yet. Subscribe to a channel to see their latest uploads.</p>
  </div>
</template>

<style lang="scss" scoped>
.no-subscriptions {
  margin: 0 auto;
  display: grid;
  justify-items: center;
  gap: 5px;
}
</style>
