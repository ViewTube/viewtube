<script setup lang="ts">
import VideoEntry from '@/components/list/VideoEntry.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import { useUserStore } from '@/store/user';

const props = defineProps<{
  videos: any[];
  short?: boolean;
}>();

const showMore = ref(false);
const userStore = useUserStore();

const displayedVideos = computed(() => {
  if (props.videos) {
    if (!showMore.value) {
      let videoCount = 12;
      if (userStore.isLoggedIn && props.short) {
        videoCount = 8;
      }
      return props.videos.slice(0, videoCount);
    }
    return props.videos;
  }
  return [];
});

const showMoreVideos = (): void => {
  showMore.value = true;
};
</script>

<template>
  <SectionTitle v-if="videos?.length > 0" :title="'Popular videos'" />
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
      v-if="videos?.length > 0 && displayedVideos.length !== videos?.length"
      :click="showMoreVideos"
    >
      <VTIcon name="mdi:reload" />
      <p>Show more</p>
    </BadgeButton>
  </div>
</template>
