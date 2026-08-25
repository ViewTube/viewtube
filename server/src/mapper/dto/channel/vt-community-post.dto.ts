import { VTAuthorDto } from '../vt-author.dto';
import { VTThumbnailDto } from '../vt-thumbnail.dto';
import { VTVideoDto } from '../vt-video.dto';

export class VTCommunityPostPollDto {
  choices: Array<string>;
  totalVotesText?: string;
  /** Quizzes are polls with a right answer; absent for an ordinary poll. */
  correctChoice?: string;
}

/**
 * Discriminated by `type` with one typed field per kind rather than a union, which the swagger
 * plugin would emit as `Record<string, never>`.
 */
export class VTCommunityPostAttachmentDto {
  type: 'image' | 'multiImage' | 'poll' | 'quiz' | 'video';
  image?: Array<VTThumbnailDto>;
  images?: Array<Array<VTThumbnailDto>>;
  poll?: VTCommunityPostPollDto;
  video?: VTVideoDto;
}

export class VTCommunityPostDto {
  id: string;
  text?: string;
  author?: VTAuthorDto;
  published?: {
    text?: string;
    date?: Date;
  };
  likeCount?: number;
  voteText?: string;
  commentText?: string;
  attachment?: VTCommunityPostAttachmentDto;
}
