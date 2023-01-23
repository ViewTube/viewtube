const baseSortOptions = ['newest', 'oldest', 'popular'] as const;

export const sortOptions = baseSortOptions.map(opt => ({
  value: opt,
  label: opt[0].toUpperCase() + opt.substring(1)
}));

export type SortOptionsType = (typeof baseSortOptions)[number];
