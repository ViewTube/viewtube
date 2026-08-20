import { toVTVideoDtoList } from 'server/mapper/converter/video/vt-video-node.converter';
import { TOPIC_CHANNELS } from './category-feed.constants';
import { CategoryDefinition, CategorySource } from './category-feed.types';

const musicExploreSectionRegex = /trending|new music videos/i;

const musicExploreSource: CategorySource = {
  id: 'music:explore',
  fetch: async client => {
    const explore = await client.music.getExplore();
    const nodes = (explore.sections ?? [])
      .filter(section => musicExploreSectionRegex.test(section?.header?.title?.text ?? ''))
      .flatMap(section => (section as unknown as { contents?: Array<any> })?.contents ?? [])
      .filter(item => item?.item_type === 'video');

    return toVTVideoDtoList(nodes);
  }
};

const topicChannelSource = (channelId: string): CategorySource => ({
  id: `channel:${channelId}`,
  fetch: async client => {
    const channel = await client.getChannel(channelId);
    return toVTVideoDtoList(channel.videos);
  }
});

const searchSource = (query: string): CategorySource => ({
  id: `search:${query}`,
  fetch: async client => {
    const search = await client.search(query, { type: 'video' });
    return toVTVideoDtoList(search.videos);
  }
});

export const categoryDefinitions: Array<CategoryDefinition> = [
  {
    category: 'music',
    sources: [musicExploreSource, searchSource('music video')]
  },
  {
    category: 'gaming',
    sources: [topicChannelSource(TOPIC_CHANNELS.gaming), searchSource('gaming')]
  },
  {
    category: 'sports',
    sources: [topicChannelSource(TOPIC_CHANNELS.sports), searchSource('sports highlights')]
  },
  {
    category: 'podcasts',
    sources: [searchSource('podcast')]
  },
  {
    category: 'live',
    sources: [topicChannelSource(TOPIC_CHANNELS.live), searchSource('live stream')]
  },
  {
    category: 'learning',
    sources: [topicChannelSource(TOPIC_CHANNELS.learning), searchSource('documentary')]
  },
  {
    category: 'fashion',
    sources: [topicChannelSource(TOPIC_CHANNELS.fashion), searchSource('fashion show')]
  }
];
