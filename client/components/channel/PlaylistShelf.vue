<script setup lang="ts">
import { ApiDto } from 'viewtube/shared';
import VideoEntry from '@/components/list/VideoEntry.vue';

type ShelfType = {
  shelfName: string;
  shelfUrl: string;
  type: string;
  items: ApiDto<'VTVideoDto'>[];
};

defineProps<{
  shelf: ShelfType;
}>();
</script>

<template>
  <div class="channel-shelf" @touchstart.stop>
    <div v-for="(item, index) in shelf.items" :key="index" class="channel-shelf-item">
      <VideoEntry v-if="(item as any).type === 'video'" :video="item" />
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
