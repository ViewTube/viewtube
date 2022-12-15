<script setup lang="ts">
const route = useRoute();
const channelId = computed(() => route.params.id?.toString() ?? null);
const { data: channelInfo, pending } = useGetChannelInfo(channelId);
</script>

<template>
  <div v-if="!pending && channelInfo" class="channel-home">
    <ChannelBannerLinks :bannerLinks="{ ...channelInfo?.channelLinks, type: 'links' }" />
    <p>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore placeat illum suscipit
      eveniet iusto? Beatae fuga quas, mollitia nam explicabo maiores omnis! Impedit aspernatur
      obcaecati facilis, voluptatem quibusdam at non?
    </p>
    <p>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore placeat illum suscipit
      eveniet iusto? Beatae fuga quas, mollitia nam explicabo maiores omnis! Impedit aspernatur
      obcaecati facilis, voluptatem quibusdam at non?
    </p>
    <p>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore placeat illum suscipit
      eveniet iusto? Beatae fuga quas, mollitia nam explicabo maiores omnis! Impedit aspernatur
      obcaecati facilis, voluptatem quibusdam at non?
    </p>
    <p>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore placeat illum suscipit
      eveniet iusto? Beatae fuga quas, mollitia nam explicabo maiores omnis! Impedit aspernatur
      obcaecati facilis, voluptatem quibusdam at non?
    </p>
  </div>
</template>

<style lang="scss" scoped>
// .channel-home {
// }
</style>
