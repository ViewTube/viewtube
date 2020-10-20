<template>
  <div class="vertical-shelf">
    <SectionTitle :title="data.title" />
    <div class="vertical-shelf-container">
      <VideoEntry v-for="video in data.items" :key="video.videoId" :video="video" :lazy="true" />
    </div>
  </div>
</template>

<script lang="ts">
import VideoEntry from '@/components/list/VideoEntry.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import Vue from 'vue';

export default Vue.extend({
  name: 'VerticalShelf',
  components: {
    VideoEntry,
    SectionTitle
  },
  props: {
    data: Object
  }
});
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
