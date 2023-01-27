const selectSortOptions = (sortOptions: readonly string[]) => {
  return sortOptions.map(opt => ({
    value: opt,
    label: opt[0].toUpperCase() + opt.substring(1)
  }));
};

const baseChannelVideosSortOptions = ['newest', 'oldest', 'popular'] as const;
export const channelVideosSortOptions = selectSortOptions(baseChannelVideosSortOptions);
export type ChannelVideosSortOptionsType = (typeof baseChannelVideosSortOptions)[number];

const baseChannelPlaylistsSortOptions = ['last', 'oldest', 'newest'] as const;
export const channelPlaylistsSortOptions = [
  { value: 'last', label: 'Last updated' },
  ...selectSortOptions(baseChannelPlaylistsSortOptions).slice(1)
];
export type ChannelPlaylistsSortOptionsType = (typeof baseChannelPlaylistsSortOptions)[number];
