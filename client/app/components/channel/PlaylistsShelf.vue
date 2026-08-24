<script setup lang="ts">
import type { ApiDto } from '@viewtube/shared';
import PlaylistEntry from '~/components/list/PlaylistEntry.vue';

defineProps<{
  shelf: ApiDto<'VTChannelShelfDto'>;
}>();
</script>

<template>
  <div class="channel-shelf" @touchstart.stop>
    <div v-for="playlist in shelf.playlists ?? []" :key="playlist.id" class="channel-shelf-item">
      <PlaylistEntry :playlist="playlist" />
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
