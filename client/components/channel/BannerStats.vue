<script setup lang="ts">
import { ApiDto } from 'viewtube/shared';

defineProps<{
  channelInfo: ApiDto<'ChannelInfoDto'>;
}>();
</script>

<template>
  <div class="stats">
    <VTIcon
      v-if="channelInfo.isFamilyFriendly"
      v-tippy="'Family Friendly'"
      name="mdi:account-child-outline"
      class="family-friendly"
    />
    <VTIcon
      v-if="channelInfo.isOfficialArtist"
      v-tippy="'Official Artist'"
      name="mdi:account-music-outline"
      class="artist"
    />
  </div>
</template>

<style lang="scss" scoped>
.stats {
  display: flex;
  color: var(--theme-color);

  .artist {
    color: var(--theme-color-alt);
  }
}
</style>
