import { YTNodes } from 'youtubei.js';
import { collectFeedNodes, ParsedFeedResponse } from './channel-feed';
import { ContentFilterType, SortType } from './types/sort';

/**
 * Fallback for when a locally built token stops being accepted: read the tokens back off the chip
 * bar the way the web client does. Costs an extra request, since the tab has to be fetched first.
 *
 * The bar comes in two layouts. On a channel without memberships the sorts are chips of their own,
 * each carrying a token. On a channel with memberships the sort collapses into a dropdown whose
 * options live in a sheet, and the freed space holds the "Members only" / "Public" chips.
 */
const SORT_LABELS: Record<SortType, string> = {
  newest: 'Latest',
  popular: 'Popular',
  oldest: 'Oldest'
};

const FILTER_LABELS: Record<Exclude<ContentFilterType, 'all'>, string> = {
  public: 'Public',
  members: 'Members only'
};

type ChipApproximation = {
  text?: string;
  tap_command?: { payload?: { token?: string } } | null;
};

type SortOptionApproximation = {
  title?: { text?: string } | null;
  renderer_context?: {
    command_context?: {
      on_tap?: { payload?: { commands?: Array<{ continuationCommand?: { token?: string } }> } };
    };
  } | null;
};

const chipsOf = (parsed: ParsedFeedResponse): Array<ChipApproximation> => {
  return collectFeedNodes(parsed, YTNodes.ChipBarView).flatMap(
    bar => (bar as YTNodes.ChipBarView)?.chips ?? []
  );
};

const chipToken = (parsed: ParsedFeedResponse, label: string): string => {
  const token = chipsOf(parsed).find(chip => chip?.text === label)?.tap_command?.payload?.token;

  return token ? decodeURIComponent(token) : undefined;
};

/** Sort options of a dropdown chip, parsed out of the sheet it opens. */
const sheetSortToken = (parsed: ParsedFeedResponse, label: string): string => {
  const item = collectFeedNodes(parsed, YTNodes.ListView)
    .flatMap(view => ((view as YTNodes.ListView)?.items ?? []) as Array<SortOptionApproximation>)
    .find(entry => entry?.title?.text === label);

  const token = (item?.renderer_context?.command_context?.on_tap?.payload?.commands ?? []).find(
    command => command?.continuationCommand?.token
  )?.continuationCommand?.token;

  return token ? decodeURIComponent(token) : undefined;
};

export const extractSortToken = (parsed: ParsedFeedResponse, sort: SortType): string => {
  const label = SORT_LABELS[sort];
  if (!label) return undefined;

  return chipToken(parsed, label) ?? sheetSortToken(parsed, label);
};

export const extractFilterToken = (
  parsed: ParsedFeedResponse,
  filter: ContentFilterType
): string => {
  if (filter === 'all') return undefined;

  return chipToken(parsed, FILTER_LABELS[filter]);
};

/**
 * Which filters this channel actually offers, so the client can hide the control where youtube
 * shows none. Only channels with memberships have anything to filter.
 */
export const extractAvailableFilters = (parsed: ParsedFeedResponse): Array<ContentFilterType> => {
  const labels = chipsOf(parsed).map(chip => chip?.text);
  const available = (Object.keys(FILTER_LABELS) as Array<Exclude<ContentFilterType, 'all'>>).filter(
    filter => labels.includes(FILTER_LABELS[filter])
  );

  return available.length ? ['all', ...available] : [];
};
