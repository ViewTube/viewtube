import type { YTNodes } from 'youtubei.js';
import { extractComments, extractHeader } from './vt-comments.extractors';

export const toVTCommentsResponseDto = (
  contents: YTNodes.CommentThread[],
  header: YTNodes.CommentsHeader
) => {
  return {
    comments: extractComments(contents),
    header: extractHeader(header)
  };
};
