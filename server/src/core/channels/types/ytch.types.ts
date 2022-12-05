import ytch from 'yt-channel-info';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AwaitedReturnType<T extends (...args: never) => any> = Awaited<ReturnType<T>>;

export type ChannelHomeResponse = AwaitedReturnType<typeof ytch.getChannelHome>;
export type ChannelVideosResponse = AwaitedReturnType<typeof ytch.getChannelVideos>;
export type ChannelVideosContinuationResponse = AwaitedReturnType<typeof ytch.getChannelVideosMore>;
export type ChannelInfoResponse = AwaitedReturnType<typeof ytch.getChannelInfo>;
export type ChannelPlaylistInfoResponse = AwaitedReturnType<typeof ytch.getChannelPlaylistInfo>;
export type ChannelPlaylistContinuationResponse = AwaitedReturnType<
  typeof ytch.getChannelPlaylistsMore
>;
export type ChannelSearchResponse = AwaitedReturnType<typeof ytch.searchChannel>;
export type ChannelSearchContinuationResponse = AwaitedReturnType<typeof ytch.searchChannelMore>;
export type RelatedChannelsContinuationResponse = AwaitedReturnType<
  typeof ytch.getRelatedChannelsMore
>;
export type ChannelCommunityPostsResponse = AwaitedReturnType<typeof ytch.getChannelCommunityPosts>;
export type ChannelCommunityPostsContinuationResponse = AwaitedReturnType<
  typeof ytch.getChannelCommunityPostsMore
>;
export type ChannelStatsResponse = AwaitedReturnType<typeof ytch.getChannelStats>;

export type ChannelVideo = ChannelHomeResponse['featuredVideo'];
export type RelatedChannel = ChannelInfoResponse['relatedChannels'][number];
export type ChannelPlaylist = ChannelPlaylistInfoResponse['items'][number];
export type ChannelImage = ChannelVideo['videoThumbnails'][number];
export type ChannelIdType = number;

export type ChannelMix = {
  playlistId: string;
  title: string;
  description: string;
  videoCount: number;
  url: string;
  thumbnails: ChannelImage[];
};
