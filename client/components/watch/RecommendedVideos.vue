<script setup lang="ts">
import VideoEntry from '@/components/list/VideoEntry.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';

const props = defineProps<{
  recommendedVideos: any[];
}>();

const videosExpanded = ref(false);

const recommendedVideosShort = computed(() => {
  return videosExpanded.value ? props.recommendedVideos : props.recommendedVideos.slice(0, 4);
});

const expand = () => {
  videosExpanded.value = true;
};

watch(
  () => props.recommendedVideos,
  (newValue: any, oldValue: any) => {
    if (newValue !== oldValue) {
      videosExpanded.value = true;
    }
  }
);
</script>

<template>
  <div class="recommended-videos">
    <div v-if="recommendedVideosShort" class="recommended-videos-container">
      <VideoEntry
        v-for="video in recommendedVideosShort"
        :key="video.videoId"
        :video="video"
        :lazy="true"
      />
      <div class="show-more-container">
        <BadgeButton v-if="!videosExpanded" :click="expand">
          <VTIcon name="mdi:reload" />
          <p>Show more</p>
        </BadgeButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.recommended-videos {
  .recommended-videos-container {
    display: grid;
    grid-template-columns: minmax(300px, 1fr);
    // grid-auto-rows: minmax(300px, auto);
    gap: 1em 2em;
    padding: 0 15px;

    .show-more-container {
      display: flex;

      .badge-btn {
        margin: 0 auto;
      }
    }
  }
}
</style>
