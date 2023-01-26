<script setup lang="ts">
import RelatedChannels from '../RelatedChannels.vue';

const route = useRoute();

const channelId = computed(() => getChannelIdFromParam(route.params.id));

const { data, pending } = useGetChannelInfo(channelId);
</script>

<template>
  <Spinner v-if="pending" />
  <div v-if="!pending && data.relatedChannels?.items?.length > 0" class="featured-channels">
    <RelatedChannels :related-channels="{ ...data?.relatedChannels, type: 'channels' }" />
  </div>
  <div v-if="!pending && data.relatedChannels?.items.length === 0" class="no-related-channels">
    <p>This channel doesn't feature other channels</p>
  </div>
</template>

<style lang="scss" scoped>
.featured-channels {
  margin: 15px;
  .no-related-channels {
    display: flex;
    justify-content: center;
    margin: 15px 0 0 0;
    height: 90vh;
  }
}
</style>
