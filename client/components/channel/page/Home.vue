<script setup lang="ts">
const route = useRoute();
const channelId = computed(() => route.params.id?.toString() ?? null);
const { data: channelInfo, pending } = useGetChannelInfo(channelId);
</script>

<template>
  <div v-if="!pending && channelInfo" class="channel-home">
    <ChannelBannerLinks :bannerLinks="{ ...channelInfo?.channelLinks, type: 'links' }" />
  </div>
</template>

<style lang="scss" scoped>
// .channel-home {
// }
</style>
