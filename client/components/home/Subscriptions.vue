<script setup lang="ts">
import VideoEntry from '@/components/list/VideoEntry.vue';

const { data: subscriptions, pending: subscriptionsLoading } = useGetUserSubscriptions({
  limit: 4
});
</script>

<template>
  <SectionTitle :title="'Subscriptions'" :link="'subscriptions'" />
  <Spinner v-if="subscriptionsLoading" />
  <div v-if="subscriptions?.videos?.length > 0" class="home-videos-container small">
    <VideoEntry
      v-for="video in subscriptions.videos"
      :key="video.videoId"
      :video="video"
      :lazy="true"
    />
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
