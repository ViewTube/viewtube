<template>
  <div class="shelf">
    <SectionTitle :title="data.title" />
    <div class="shelf-container">
      <VideoEntry v-for="video in data.items" :key="video.videoId" :video="video" :lazy="true" />
    </div>
  </div>
</template>

<script lang="ts">
import VideoEntry from '@/components/list/VideoEntry.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import Vue from 'vue';

export default Vue.extend({
  name: 'Shelf',
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
.shelf {
  display: flex;
  flex-direction: column;

  .shelf-container {
    @include viewtube-grid;
  }
}
</style>
