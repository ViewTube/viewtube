<script setup lang="ts">
import PlaylistEntry from '~/components/list/PlaylistEntry.vue';

type ShelfItemType = {
  title: string;
  type: string;
  playlistThumbnail: string;
  author: string;
  authorUrl: string;
  authorId: string;
  playlistId: string;
  playlistUrl: string;
  videoCount: number;
};

type ShelfType = {
  shelfName: string;
  shelfUrl: string;
  type: string;
  items: Array<ShelfItemType>;
};

defineProps<{
  shelf: ShelfType;
}>();
</script>

<template>
  <div class="channel-shelf" @touchstart.stop>
    <div v-for="(item, index) in shelf.items" :key="index" class="channel-shelf-item">
      <PlaylistEntry v-if="item.type === 'playlist'" :playlist="item" />
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
