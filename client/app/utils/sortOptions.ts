const selectSortOptions = (sortOptions: readonly string[]) => {
  return sortOptions.map(opt => ({
    value: opt,
    label: opt[0].toUpperCase() + opt.substring(1)
  }));
};

const baseChannelVideosSortOptions = ['newest', 'oldest', 'popular'] as const;
export const channelVideosSortOptions = selectSortOptions(baseChannelVideosSortOptions);
export type ChannelVideosSortOptionsType = (typeof baseChannelVideosSortOptions)[number];

const channelVideosFilterLabels = {
  all: 'All',
  public: 'Public',
  members: 'Members only'
} as const;
export const channelVideosFilterOptions = Object.entries(channelVideosFilterLabels).map(
  ([value, label]) => ({ value, label })
);
export type ChannelVideosFilterOptionsType = keyof typeof channelVideosFilterLabels;
