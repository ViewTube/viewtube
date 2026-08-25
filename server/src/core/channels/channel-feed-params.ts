import { BinaryWriter } from '@bufbuild/protobuf/wire';
import { ContentFilterType, SortType } from './types/sort';

/**
 * YouTube moved the channel feed sort and the members-only filter into a chip bar whose
 * continuation tokens are handed out per response, which is why `youtubei.js`'s `applySort` and
 * `content_type_filters` no longer work. (They look for a `SortFilterSubMenu` / a `SectionList`
 * that the chip bar replaced.)
 *
 * The tokens are plain protobuf and everything that selects content is static, so they can be
 * built locally. The structure is:
 *
 *   outer { 2: channelId, 3: base64url(inner) }        // field 80226972
 *   inner: 110 > 3 > <tab> > <slot> > { 1: targetId, 3: sort, 4: filter }
 *
 * The tab is expressed as the two nested field numbers, and the sort values are per tab.
 * `targetId` identifies the UI element YouTube would reload; it is not validated, but the
 * field has to be present.
 */
const CONTINUATION_FIELD = 80226972;
const TARGET_ID = '00000000-0000-0000-0000-000000000000';

export type ChannelFeedTab = 'videos' | 'shorts' | 'live';

type TabDescriptor = {
  fields: [number, number];
  sorts: Record<SortType, number>;
  /** Only the videos tab offers the members-only content filter. */
  filterable: boolean;
};

const TABS: Record<ChannelFeedTab, TabDescriptor> = {
  videos: { fields: [15, 8], sorts: { newest: 4, popular: 2, oldest: 5 }, filterable: true },
  shorts: { fields: [10, 7], sorts: { newest: 4, popular: 2, oldest: 5 }, filterable: false },
  live: { fields: [14, 8], sorts: { newest: 12, popular: 14, oldest: 13 }, filterable: false }
};

/**
 * Opaque filter expressions lifted from the chip bar. They carry no channel- or session-specific
 * data, so they are safe as constants. "all" is the absence of field 4.
 */
const FILTER_VALUES: Record<Exclude<ContentFilterType, 'all'>, string> = {
  public: 'ChkKBZIZAggCCgcaBQoDggEACgcaBQoD6gEA',
  members: 'Cg4KA+oBAAoHGgUKA4IBAA=='
};

const lengthDelimited = (field: number, payload: Uint8Array): Uint8Array => {
  return new BinaryWriter()
    .uint32((field << 3) | 2)
    .bytes(payload)
    .finish();
};

export const buildChannelFeedToken = ({
  channelId,
  tab = 'videos',
  sort = 'newest',
  filter = 'all'
}: {
  channelId: string;
  tab?: ChannelFeedTab;
  sort?: SortType;
  filter?: ContentFilterType;
}): string => {
  const descriptor = TABS[tab] ?? TABS.videos;

  const leaf = new BinaryWriter();
  leaf.uint32(10).string(TARGET_ID);
  leaf.uint32(24).int32(descriptor.sorts[sort] ?? descriptor.sorts.newest);

  if (descriptor.filterable && filter !== 'all') {
    leaf.uint32(34).bytes(Buffer.from(FILTER_VALUES[filter], 'base64'));
  }

  const [tabField, slotField] = descriptor.fields;
  const inner = lengthDelimited(
    110,
    lengthDelimited(3, lengthDelimited(tabField, lengthDelimited(slotField, leaf.finish())))
  );

  const outer = new BinaryWriter();
  outer.uint32(18).string(channelId);
  // YouTube expects the nested message as url-safe base64. Its own tokens percent-encode the
  // padding, but a wrong pad count is accepted and silently returns the whole channel page
  // instead of the feed, so it is left off entirely.
  outer.uint32(26).string(Buffer.from(inner).toString('base64url'));

  return Buffer.from(lengthDelimited(CONTINUATION_FIELD, outer.finish())).toString('base64');
};

export const isFilterableTab = (tab: ChannelFeedTab): boolean => Boolean(TABS[tab]?.filterable);
