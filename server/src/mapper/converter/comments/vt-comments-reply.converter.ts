import { YTNodes } from 'youtubei.js';
import { extractCommentViews } from './vt-comments.extractors';

export const toVTCommentsReplyResponseDto = (contents: YTNodes.CommentView[]) => {
  return {
    comments: extractCommentViews(contents)
  };
};
