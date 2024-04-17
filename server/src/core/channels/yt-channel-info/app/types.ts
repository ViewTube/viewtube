import type { HttpsProxyAgent } from 'https-proxy-agent';

export enum ChannelIdType {
  Default = 0,
  ChannelId,
  LegacyName,
  CustomURL,
  ChannelTag,
  ChannelUrl
}

export interface ChannelInfoError {
  alertMessage: string;
}

/**
 * A abstract ChannelInfoResponse containing a continuation string if there are more responses which can be loaded
 * and an array of items of the type T
 */
export interface ChannelInfoResponseContinuation<T> {
  items?: T[];
  /**
   * Will be null if no more results can be found.  Used with getChannelPlaylistsMore()
   */
  continuation?: string | null;
}

export interface ChannelInfoResponse<T> extends ChannelInfoResponseContinuation<T> {
  channelIdType?: ChannelIdType;
}

export interface ChannelCommunityPostsContinuationResponse
  extends ChannelInfoResponseContinuation<CommunityPost> {
  innerTubeApi?: string;
}
export interface ChannelCommunityPostsResponse extends ChannelCommunityPostsContinuationResponse {
  channelIdType?: ChannelIdType;
}

export interface RelatedChannel {
  author: string;
  authorId: string;
  authorUrl: string;
  authorThumbnails: Image[];
  videoCount: number;
  subscriberText: string;
  subscriberCount: number;
  verified: boolean;
  officialArtist: boolean;
}

export interface ContinuationPayload {
  continuation: string;
  httpsAgent?: HttpsProxyAgent<string>;
}
/**
 * ChannelInfo payload passed into getChannelInfo
 */

export interface ChannelInfoPayload {
  channelId: string;
  channelIdType?: ChannelIdType;
  httpsAgent?: HttpsProxyAgent<string>;
}

export interface CommunityPostContinuationPayload extends ContinuationPayload {
  innerTubeApi: string;
}
export interface ChannelVideosPayload extends ChannelInfoPayload {
  sortBy?: 'newest' | 'oldest' | 'popular';
}

export interface ChannelSearchPayload extends ChannelInfoPayload {
  query: string;
}

export interface ChannelPlaylistPayload extends ChannelInfoPayload {
  sortBy?: 'last' | 'newest';
}

export interface ChannelLivestreamsPayload extends ChannelInfoPayload {
  sortBy?: 'newest';
}

export interface ChannelShortsPayload extends ChannelInfoPayload {
  sortBy?: 'newest';
}

/**
 * ChannelInfo type returned by getChannelVideos and getChannelInfoMore
 */
export interface ChannelInfo {
  author: string;
  authorId: string;
  authorUrl: string;
  /**
   * Is null if none exist
   **/
  authorBanners: Image[] | null;
  /**
   * Is null if none exist
   **/
  authorThumbnails: Image[] | null;
  subscriberText: string;
  subscriberCount: number;
  description: string;
  isFamilyFriendly: boolean;
  relatedChannels: ChannelInfoResponseContinuation<RelatedChannel>;
  allowedRegions: string[];
  isVerified: boolean;
  isOfficialArtist: boolean;
  tags: string[];
  channelIdType: number;
  channelTabs: string[];
  channelLinks: {
    primaryLinks: ChannelLink[];
    secondaryLinks: ChannelLink[];
  };
}

export interface ChannelLink {
  url: string;
  icon: string;
  title: string;
}

/**
 * An Image which represents all banners and thumbnails
 */
export interface Image {
  url: string;
  height: number;
  width: number;
}

/**
 * Video type returned by getChannelVideos and getChannelInfoMore
 */
export interface Video {
  author: string;
  authorId: string;
  durationText?: string;
  lengthSeconds?: number;
  liveNow: boolean;
  premiere: boolean;
  premium: boolean;
  publishedText: string;
  title: string;
  type: 'video';
  videoId: string;
  videoThumbnails: Image[] | null;
  viewCount: number;
  viewCountText: string;
}

/**
 * Playlist type returned by getChannelPlaylistInfo and getChannelPlaylistsMore
 */
export interface Playlist {
  author: string;
  authorId: string;
  authorUrl: string;
  playlistId: string;
  playlistThumbnail: string;
  playlistUrl: string;
  title: string;
  type: 'playlist';
  videoCount: number;
}

export interface ImagePostContent {
  type: 'image';
  content: Image[];
}

export interface PollPostContent {
  type: 'poll';
  content: {
    choices: string[];
    totalVotes: string;
  };
}

export interface VideoPostContent {
  type: 'video';
  content: {
    videoId: string;
    title: string;
    description: string;
    publishedText: string;
    lengthText: string;
    viewCountText: string;
    ownerBadges: {
      verified: boolean;
      officialArtist: boolean;
    };
    author: string;
    thumbnails: Image[];
  };
}
export interface PlaylistPostContent {
  type: 'playlist';
  content: {
    playlistId: string;
    title: string;
    playlistVideoRenderer: VideoPostContent[];
    videoCountText: string;
    ownerBadges: {
      verified: boolean;
      officialArtist: boolean;
    };
    author: string;
    thumbnails: Image[];
  };
}
export interface CommunityPost {
  postText: string;
  postId: string;
  author: string;
  authorThumbnails: string;
  publishedText: string;
  voteCount: string;
  postContent: ImagePostContent | PollPostContent | VideoPostContent | PlaylistPostContent | null;
}

export interface ChannelStatsResponse {
  joinedDate: number;
  viewCount: number;
  location: string;
}

export interface Mix {
  playlistId: string;
  title: string;
  description: string;
  videoCount: number;
  url: string;
  thumbnails: Image[];
}
export interface ChannelHomeResponse {
  featuredVideo: Video;
  items: {
    shelfName: string;
    type:
      | 'videos'
      | 'verticalVideoList'
      | 'playlist'
      | 'channels'
      | 'mix'
      | 'playlists'
      | 'video'
      | 'livestreams';
    items: Video[] | RelatedChannel[] | Playlist[] | Mix[];
  }[];
}
