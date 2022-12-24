<script setup lang="ts">
import { ApiDto } from 'viewtube/shared';
import VideoEntry from '@/components/list/VideoEntry.vue';

type ShelfType = {
  shelfName: string;
  shelfUrl: string;
  type: string;
  items: ApiDto<'VideoDto'>[];
};

defineProps<{
  shelf: ShelfType;
}>();

const channelShelfRef = ref<HTMLElement | null>(null);
</script>

<template>
  <div ref="channelShelfRef" class="channel-shelf" @touchstart.stop>
    <div v-for="(item, index) in shelf.items" :key="index" class="channel-shelf-item">
      <VideoEntry v-if="item.type === 'video'" :video="item" />
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
