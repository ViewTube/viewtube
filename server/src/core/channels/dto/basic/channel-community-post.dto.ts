import {
  ChannelCommunityPost,
  ChannelCommunityPostImage,
  ChannelCommunityPostPlaylist,
  ChannelCommunityPostPoll,
  ChannelCommunityPostVideo
} from '../../types/ytch.types';

export class ChannelCommunityPostDto implements ChannelCommunityPost {
  postText: string;
  postId: string;
  author: string;
  authorThumbnails: string;
  publishedText: string;
  voteCount: string;
  postContent:
    | ChannelCommunityPostImage
    | ChannelCommunityPostPoll
    | ChannelCommunityPostVideo
    | ChannelCommunityPostPlaylist
    | null;
}
