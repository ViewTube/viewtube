import type {
  CommunityPost,
  ImagePostContent,
  PlaylistPostContent,
  PollPostContent,
  VideoPostContent
} from '../../yt-channel-info/app/types';

export class ChannelCommunityPostDto implements CommunityPost {
  postText: string;
  postId: string;
  author: string;
  authorThumbnails: string;
  publishedText: string;
  voteCount: string;
  commentCount: string;
  postContent: ImagePostContent | PollPostContent | VideoPostContent | PlaylistPostContent | null;
}
