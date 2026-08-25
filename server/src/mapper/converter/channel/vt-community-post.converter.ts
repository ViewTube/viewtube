import { logger } from 'server/common/logger';
import { toVTVideoDtoFromNode } from 'server/mapper/converter/video/vt-video-node.converter';
import {
  VTCommunityPostAttachmentDto,
  VTCommunityPostDto
} from 'server/mapper/dto/channel/vt-community-post.dto';
import { VTThumbnailDto } from 'server/mapper/dto/vt-thumbnail.dto';
import { fixUrl } from 'server/mapper/utils/fix-url';
import { parseRelativeTime } from 'server/mapper/utils/parse-relative-time';
import {
  CommunityPostApproximation,
  CommunityPostAttachmentApproximation
} from './community-post-source-approximation';

const mapThumbnails = (
  thumbnails: Array<Pick<VTThumbnailDto, 'url' | 'width' | 'height'>>
): Array<VTThumbnailDto> => {
  return thumbnails?.map(thumbnail => ({
    url: fixUrl(thumbnail.url),
    width: thumbnail.width,
    height: thumbnail.height
  }));
};

const toPoll = (attachment: CommunityPostAttachmentApproximation) => {
  return {
    choices: (attachment?.choices ?? []).map(choice => choice?.text?.text).filter(Boolean),
    totalVotesText: attachment?.total_votes?.text,
    correctChoice: attachment?.choices?.find(choice => choice?.is_correct)?.text?.text
  };
};

const toVTCommunityPostAttachmentDto = (
  attachment: CommunityPostAttachmentApproximation
): VTCommunityPostAttachmentDto | undefined => {
  switch (attachment?.type) {
    case 'BackstageImage':
      return { type: 'image', image: mapThumbnails(attachment.image) };
    case 'PostMultiImage':
      return {
        type: 'multiImage',
        images: (attachment.images ?? [])
          .map(entry => mapThumbnails(entry?.image))
          .filter(images => images?.length)
      };
    case 'Poll':
      return { type: 'poll', poll: toPoll(attachment) };
    case 'Quiz':
      return { type: 'quiz', poll: toPoll(attachment) };
    case 'Video': {
      const video = toVTVideoDtoFromNode(attachment);
      return video ? { type: 'video', video } : undefined;
    }
    case undefined:
    case null:
      return undefined;
    default:
      logger.log(`Unknown community post attachment type ${attachment?.type}`);
      return undefined;
  }
};

export const toVTCommunityPostDto = (
  post: CommunityPostApproximation
): VTCommunityPostDto | null => {
  const id = post?.id;
  if (!id) return null;

  const publishedText = post?.published?.text;

  return {
    id,
    text: post?.content?.text,
    author: post?.author?.id
      ? {
          id: post.author.id,
          name: post.author.name,
          thumbnails: mapThumbnails(post.author.thumbnails),
          isVerified: post.author.is_verified,
          isArtist: post.author.is_verified_artist
        }
      : undefined,
    published: publishedText
      ? { text: publishedText, date: parseRelativeTime(publishedText)?.toDate() }
      : undefined,
    likeCount: post?.action_buttons?.like_button?.like_count,
    voteText: post?.vote_count?.text,
    commentText: post?.action_buttons?.reply_button?.text?.text,
    attachment: toVTCommunityPostAttachmentDto(post?.attachment)
  };
};

export const toVTCommunityPostDtoList = (
  posts: Array<CommunityPostApproximation>
): Array<VTCommunityPostDto> => {
  return (posts ?? []).map(post => toVTCommunityPostDto(post)).filter(Boolean);
};
