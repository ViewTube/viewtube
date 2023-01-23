<script setup lang="ts">
import RelatedChannels from '@/components/channel/RelatedChannels.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';

const route = useRoute();
const channelId = computed(() => getChannelIdFromParam(route.params.id));
const { data: channelInfo, pending } = useGetChannelInfo(channelId);
const { data: channelHome, pending: pendingHome } = useGetChannelHome(channelId);
</script>

<template>
  <Spinner v-if="pending || pendingHome" />
  <div v-if="!pending && !pendingHome && channelInfo && channelHome" class="channel-home">
    <SectionTitle title="Info" />
    <pre v-if="channelInfo.description" class="channel-description">{{
      channelInfo.description?.trim()
    }}</pre>
    <SectionSubtitle v-if="channelInfo.channelLinks" title="Links" class="channel-links-title" />
    <ChannelBannerLinks
      v-if="channelInfo.channelLinks"
      :banner-links="{ ...channelInfo?.channelLinks, type: 'links' }"
    />
    <SectionSubtitle v-if="channelInfo.tags" title="Tags" class="channel-tags-title" />
    <div v-if="channelInfo.tags" class="channel-tags">
      <BadgeButton
        v-for="tag in channelInfo.tags"
        :key="tag"
        class="channel-tag"
        :href="`/results?search_query=${tag}`"
        internal-link
      >
        {{ tag }}
      </BadgeButton>
    </div>
    <SectionTitle v-if="channelInfo.relatedChannels?.items?.length > 0" title="Related channels" />
    <RelatedChannels
      v-if="channelInfo.relatedChannels?.items?.length > 0"
      :related-channels="{ ...channelInfo.relatedChannels, type: 'channels' }"
    />
    <SectionTitle v-if="channelHome.featuredVideo" title="Featured video" />
    <ChannelFeaturedVideo
      v-if="channelHome.featuredVideo"
      :featured-video="channelHome.featuredVideo"
    />
    <div v-for="(shelf, index) in channelHome?.items ?? []" :key="index" class="shelves">
      <SectionTitle :title="shelf.shelfName" :link="shelf.shelfUrl" />
      <ChannelPlaylistShelf
        v-if="shelf.type === 'playlist' || shelf.type === 'videos'"
        :shelf="shelf"
      />
      <ChannelPlaylistsShelf v-else-if="shelf.type === 'playlists'" :shelf="shelf" />
      <ChannelFeaturedChannelsShelf v-else-if="shelf.type === 'channels'" :shelf="shelf" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.channel-home {
  padding: 0 10px;

  .channel-links-title {
    margin-top: 10px;
  }

  .channel-tags-title {
    margin-top: 10px;
  }

  .channel-tags {
    display: flex;
    flex-direction: row;
  }

  .channel-description {
    white-space: pre-wrap;
    font-family: $default-font;
    margin: 0;
    word-break: break-word;
  }
}
</style>
