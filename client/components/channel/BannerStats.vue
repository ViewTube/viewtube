<script setup lang="ts">
import FamilyFriendlyIcon from 'vue-material-design-icons/AccountChildOutline.vue';
import ArtistIcon from 'vue-material-design-icons/AccountMusicOutline.vue';

import { ApiDto } from 'viewtube/shared';

defineProps<{
  channelInfo: ApiDto<'ChannelInfoDto'>;
}>();
</script>

<template>
  <div class="stats">
    <FamilyFriendlyIcon
      v-if="channelInfo.isFamilyFriendly"
      v-tippy="'Family Friendly'"
      class="family-friendly"
    />
    <ArtistIcon v-if="channelInfo.isOfficialArtist" v-tippy="'Official Artist'" class="artist" />
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
