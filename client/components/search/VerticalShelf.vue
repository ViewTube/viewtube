<template>
  <div class="vertical-shelf">
    <SectionTitle :title="data.title" />
    <div class="vertical-shelf-container">
      <VideoEntry v-for="video in data.items" :key="video.videoId" :video="video" />
    </div>
  </div>
</template>

<script>
import VideoEntry from '@/components/list/VideoEntry';
import SectionTitle from '@/components/SectionTitle';

export default {
  name: 'VerticalShelf',
  components: {
    VideoEntry,
    SectionTitle
  },
  props: {
    data: Object
  }
};
</script>

<style lang="scss">
.vertical-shelf {
  display: flex;
  flex-direction: column;

  .vertical-shelf-container {
    @include viewtube-grid;
  }
}
</style>
