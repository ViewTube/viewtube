<script setup lang="ts">
import RelatedChannels from '../RelatedChannels.vue';

const route = useRoute();

const channelId = computed(() => getChannelIdFromParam(route.params.id));

const { data, pending } = useGetChannelInfo(channelId);
</script>

<template>
  <Spinner v-if="pending" />
  <RelatedChannels
    v-if="!pending && data.relatedChannels?.items?.length > 0"
    :related-channels="{ ...data?.relatedChannels, type: 'channels' }"
  />
  <div v-if="!pending && data.relatedChannels?.items.length === 0" class="no-related-channels">
    <p>This channel doesn't feature other channels</p>
  </div>
</template>

<style lang="scss" scoped>
.no-related-channels {
  display: flex;
  justify-content: center;
  margin: 15px 0 0 0;
  height: 90vh;
}
</style>
