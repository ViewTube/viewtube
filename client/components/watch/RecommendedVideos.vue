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
          <Icon name="mdi:reload" />
          <p>Show more</p>
        </BadgeButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import VideoEntry from '@/components/list/VideoEntry.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';

export default defineComponent({
  name: 'RecommendedVideos',
  components: {
    VideoEntry,
    BadgeButton
  },
  props: {
    recommendedVideos: {
      required: true,
      type: Array
    }
  },
  setup(props) {
    const recommendedVideosShort = ref(null);
    const videosExpanded = ref(false);

    recommendedVideosShort.value = props.recommendedVideos.slice(0, 4);

    const expand = () => {
      recommendedVideosShort.value = props.recommendedVideos;
      videosExpanded.value = true;
    };

    watch(
      () => props.recommendedVideos,
      (newValue: any, oldValue: any) => {
        if (newValue !== oldValue) {
          recommendedVideosShort.value = props.recommendedVideos.slice(0, 4);
        }
      }
    );

    return {
      recommendedVideosShort,
      videosExpanded,
      expand
    };
  }
});
</script>

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
