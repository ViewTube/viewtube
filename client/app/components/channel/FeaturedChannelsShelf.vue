<script setup lang="ts">
import type { ApiDto } from '@viewtube/shared';
import RelatedChannels from './RelatedChannels.vue';

defineProps<{
  shelf: ApiDto<'VTChannelShelfDto'>;
}>();
</script>

<template>
  <div class="channel-shelf" @touchstart.stop>
    <RelatedChannels :channels="shelf.channels ?? []" />
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
