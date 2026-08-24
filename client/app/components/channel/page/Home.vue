<script setup lang="ts">
import dayjs from 'dayjs';
import BadgeButton from '~/components/buttons/BadgeButton.vue';

const route = useRoute();

const { createTextLinks } = useCreateTextLinks();

const channelId = computed(() => getChannelIdFromParam(route.params.id));
const { data: channelInfo, pending } = useGetChannelInfo(channelId);
const { data: channelHome, pending: pendingHome } = useGetChannelHome(channelId);
const { data: channelStats, pending: pendingStats } = useGetChannelStats(channelId);

const channelLinks = computed(() => channelInfo.value?.links ?? []);
const channelDescription = computed(() => {
  return createTextLinks(channelInfo.value?.description);
});

const hasStats = computed(() =>
  Boolean(
    channelStats.value?.joinedDate || channelStats.value?.viewCount || channelStats.value?.location
  )
);
</script>

<template>
  <Spinner v-if="pending || pendingHome || pendingStats" />
  <div v-if="!pending && !pendingHome && !pendingStats && channelInfo" class="channel-home">
    <SectionTitle title="Info" />
    <pre
      v-if="channelInfo.description"
      class="channel-description links"
      v-html="channelDescription"
    />
    <SectionSubtitle v-if="channelLinks.length" title="Links" class="channel-links-title" />
    <ChannelBannerLinks v-if="channelLinks.length" :links="channelLinks" />
    <SectionSubtitle v-if="channelInfo.tags?.length" title="Tags" class="channel-tags-title" />
    <div v-if="channelInfo.tags?.length" class="channel-tags">
      <div class="channel-tags-inner">
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
    </div>
    <SectionSubtitle v-if="hasStats" title="Stats" class="channel-stats-title" />
    <div v-if="hasStats" class="channel-stats">
      <div v-if="channelStats.joinedDate">
        Joined
        <span class="highlight">{{ dayjs(channelStats.joinedDate).format('MMMM D, YYYY') }}</span>
      </div>
      <div v-if="channelStats.viewCount">
        <span class="highlight">{{ channelStats.viewCount.toLocaleString('en-US') }}</span> total
        views
      </div>
      <div v-if="channelStats.location">
        <span class="highlight">{{ channelStats.location }}</span>
      </div>
    </div>
    <SectionTitle v-if="channelHome?.featuredVideo" title="Featured video" />
    <ChannelFeaturedVideo
      v-if="channelHome?.featuredVideo"
      :featured-video="channelHome.featuredVideo"
    />
    <div v-for="(shelf, index) in channelHome?.shelves ?? []" :key="index" class="shelves">
      <SectionTitle :title="shelf.title" />
      <ChannelPlaylistShelf
        v-if="shelf.type === 'videos' || shelf.type === 'shorts'"
        :shelf="shelf"
      />
      <ChannelPlaylistsShelf v-else-if="shelf.type === 'playlists'" :shelf="shelf" />
      <ChannelFeaturedChannelsShelf v-else-if="shelf.type === 'channels'" :shelf="shelf" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.channel-home {
  padding: 0 15px;

  .channel-links-title {
    margin-top: 10px;
  }

  .channel-tags-title,
  .channel-stats-title {
    margin-top: 10px;
  }

  .channel-stats {
    .highlight {
      color: var(--theme-color);
    }
  }

  .channel-tags {
    width: 100%;
    position: relative;
    overflow: auto hidden;
    height: 40px;

    .channel-tags-inner {
      position: absolute;
      display: flex;
      flex-direction: row;
    }
  }

  .channel-description {
    white-space: pre-wrap;
    font-family: variables.$default-font;
    margin: 0;
    word-break: break-word;
  }
}
</style>
