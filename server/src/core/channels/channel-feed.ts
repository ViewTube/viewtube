import type { Helpers } from 'youtubei.js';
import { YTNodes } from 'youtubei.js';

type NodeMemo = { getType: (type: Helpers.YTNodeConstructor) => Array<Helpers.YTNode> };

export type ParsedFeedResponse = {
  continuation_contents?: unknown;
  contents_memo?: NodeMemo;
  on_response_received_actions_memo?: NodeMemo;
  on_response_received_endpoints_memo?: NodeMemo;
  on_response_received_commands_memo?: NodeMemo;
  continuation_contents_memo?: NodeMemo;
};

/**
 * Continuation payloads arrive under a different key depending on which endpoint produced them,
 * so every lookup goes through all of the memos rather than guessing one.
 */
const memosOf = (parsed: ParsedFeedResponse): Array<NodeMemo> => {
  return [
    parsed?.contents_memo,
    parsed?.on_response_received_actions_memo,
    parsed?.on_response_received_endpoints_memo,
    parsed?.on_response_received_commands_memo,
    parsed?.continuation_contents_memo
  ].filter(Boolean);
};

export const collectFeedNodes = (
  parsed: ParsedFeedResponse,
  type: Helpers.YTNodeConstructor
): Array<Helpers.YTNode> => {
  return memosOf(parsed).flatMap(memo => memo?.getType(type) ?? []);
};

export const extractFeedContinuation = (parsed: ParsedFeedResponse): string => {
  return collectFeedNodes(parsed, YTNodes.ContinuationItem)
    .map(node => node as YTNodes.ContinuationItem)
    .find(item => item?.endpoint?.payload?.token)?.endpoint?.payload?.token;
};

/**
 * A locally built continuation token that youtube does not accept is not answered with an error.
 * It re-renders the whole channel page instead, which arrives as `continuation_contents` full of
 * home-tab shelves. Every accepted feed continuation — first page, later pages, and an empty
 * result alike — comes back as `on_response_received_actions` with no shelves, so the two are
 * cleanly distinguishable and an empty channel is never mistaken for a rejection.
 */
export const isRejectedFeedResponse = (parsed: ParsedFeedResponse): boolean => {
  if (!parsed) return true;

  const hasShelves =
    collectFeedNodes(parsed, YTNodes.Shelf).length > 0 ||
    collectFeedNodes(parsed, YTNodes.ReelShelf).length > 0;

  return Boolean(parsed.continuation_contents) || hasShelves;
};
