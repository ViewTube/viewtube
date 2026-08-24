export type SortType = 'newest' | 'oldest' | 'popular';

export type ContentFilterType = 'all' | 'public' | 'members';

/**
 * Which mechanism produced the continuation token. "params" builds it locally in a single request,
 * "discover" reads it off a chip bar the way youtubei.js does, at the cost of an extra request.
 * Only ever set explicitly to diagnose a break; the service picks on its own otherwise.
 */
export type ChannelFeedStrategy = 'params' | 'discover';
