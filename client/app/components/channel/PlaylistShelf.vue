<script setup lang="ts">
import type { ApiDto } from '@viewtube/shared';
import VideoEntry from '~/components/list/VideoEntry.vue';

defineProps<{
  shelf: ApiDto<'VTChannelShelfDto'>;
}>();
</script>

<template>
  <div class="channel-shelf" @touchstart.stop>
    <div v-for="video in shelf.videos ?? []" :key="video.id" class="channel-shelf-item">
      <VideoEntry :video="video" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.channel-shelf {
  overflow: auto hidden;
  display: flex;
  gap: 20px;

  .channel-shelf-item {
    min-width: 300px;
  }
}
</style>
