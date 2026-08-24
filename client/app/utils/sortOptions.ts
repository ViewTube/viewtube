const selectSortOptions = (sortOptions: readonly string[]) => {
  return sortOptions.map(opt => ({
    value: opt,
    label: opt[0].toUpperCase() + opt.substring(1)
  }));
};

const baseChannelVideosSortOptions = ['newest', 'oldest', 'popular'] as const;
export const channelVideosSortOptions = selectSortOptions(baseChannelVideosSortOptions);
export type ChannelVideosSortOptionsType = (typeof baseChannelVideosSortOptions)[number];

/**
 * Youtube only shows this on channels that have memberships. Public is the default so members-only
 * entries, which cannot be played here, stay out of the listing unless they are asked for.
 */
const channelVideosFilterLabels = {
  public: 'Public',
  all: 'All',
  members: 'Members only'
} as const;
export const channelVideosFilterOptions = Object.entries(channelVideosFilterLabels).map(
  ([value, label]) => ({ value, label })
);
export type ChannelVideosFilterOptionsType = keyof typeof channelVideosFilterLabels;
