import { YT } from 'youtubei.js';
import { extractComments, extractHeader } from './vt-comments.extractors';
import { VTCommentsResponseDto } from './vt-comments-response.dto';

export const toVTCommentsDto = (commentsResponse: YT.Comments): VTCommentsResponseDto => {
  return {
    comments: extractComments(commentsResponse),
    header: extractHeader(commentsResponse),
    continuation: commentsResponse?.
  };
};
